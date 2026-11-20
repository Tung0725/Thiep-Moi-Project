"""
Wedding Template & WARC Archive Extractor
=========================================
Tool giải nén và trích xuất tài nguyên từ các file lưu trữ web (.warc, .warc.gz, .wacz
hoặc thư mục ArchiveWeb.page / Webrecorder như 'my-archiving-session').

Tính năng chính:
- Tự động nhận diện file .warc, .warc.gz, .wacz hoặc thư mục chứa archive/data.warc.gz.
- Phân loại tài nguyên chuyên nghiệp:
    + images/ : Hình ảnh (webp, png, jpg, jpeg, svg, gif, ico, avif)
    + audio/  : Nhạc nền thiệp cưới (mp3, wav, m4a, ogg)
    + fonts/  : Phông chữ thiết kế (woff2, woff, ttf, otf)
    + data/   : Dữ liệu API / JSON (thông tin thiệp, danh sách bài hát, cấu hình)
    + pages/  : Mã nguồn HTML trang demo
    + styles/ : CSS
    + scripts/: Javascript
- Tự động lọc các domain theo dõi / quảng cáo rác (Google Ads, DoubleClick, Yandex, FB Pixel).
- Tự động trích xuất thông tin thiệp cưới (Cô dâu, Chú rể, Ngày giờ, Địa điểm, Nhạc, Lời chúc) từ RSC / Next.js data.
- Xuất manifest.json và báo cáo tóm tắt summary.md.
"""

import os
import sys
import json
import re
import zipfile
import gzip
import argparse
from urllib.parse import urlparse, unquote
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

try:
    from warcio.archiveiterator import ArchiveIterator
except ImportError:
    print("[ERROR] Thư viện 'warcio' chưa được cài đặt.")
    print("Vui lòng chạy: py -m pip install warcio wacz")
    sys.exit(1)


# Danh sách các domain tracking / quảng cáo cần loại bỏ để giữ tài nguyên sạch
DEFAULT_TRACKER_DOMAINS = [
    "google-analytics.com",
    "googletagmanager.com",
    "doubleclick.net",
    "googleads.g.doubleclick.net",
    "google.com.vn/pagead",
    "mc.yandex.ru",
    "connect.facebook.net",
    "facebook.com/tr",
    "clarity.ms",
    "hotjar.com",
    "tiktok.com"
]


class TemplateExtractor:
    """Bộ trích xuất và chuẩn hóa tài nguyên từ WARC/WACZ archive."""

    def __init__(
        self,
        source_path: str,
        output_dir: str,
        skip_trackers: bool = True,
        mirror_full_url: bool = False
    ):
        self.source_path = Path(source_path).resolve()
        self.output_dir = Path(output_dir).resolve()
        self.skip_trackers = skip_trackers
        self.mirror_full_url = mirror_full_url

        self.stats = {
            "total_records": 0,
            "processed_responses": 0,
            "skipped_trackers": 0,
            "categories": {
                "images": 0,
                "audio": 0,
                "fonts": 0,
                "data": 0,
                "pages": 0,
                "styles": 0,
                "scripts": 0,
                "other": 0
            },
            "total_bytes": 0
        }
        self.manifest_items: List[Dict[str, Any]] = []
        self.wedding_metadata: Dict[str, Any] = {}

    def resolve_warc_stream(self) -> Tuple[Any, Optional[zipfile.ZipFile]]:
        """Xác định và mở luồng đọc WARC từ file hoặc thư mục."""
        if not self.source_path.exists():
            raise FileNotFoundError(f"Đường dẫn nguồn không tồn tại: {self.source_path}")

        # Trường hợp 1: Thư mục (như my-archiving-session)
        if self.source_path.is_dir():
            candidates = [
                self.source_path / "archive" / "data.warc.gz",
                self.source_path / "data.warc.gz",
                self.source_path / "data.warc",
            ]
            for c in candidates:
                if c.exists():
                    print(f"[*] Tìm thấy file WARC trong thư mục: {c.name}")
                    return open(c, "rb"), None

            # Quét đệ quy tìm bất kỳ file .warc.gz hoặc .warc nào
            found = list(self.source_path.glob("**/*.warc*"))
            if found:
                print(f"[*] Tìm thấy file WARC: {found[0]}")
                return open(found[0], "rb"), None
            raise FileNotFoundError(f"Không tìm thấy file .warc.gz nào trong thư mục: {self.source_path}")

        # Trường hợp 2: File .wacz (Zip file chứa data.warc.gz)
        if self.source_path.suffix.lower() == ".wacz":
            zf = zipfile.ZipFile(self.source_path, "r")
            warc_members = [m for m in zf.namelist() if m.endswith(".warc.gz") or m.endswith(".warc")]
            if not warc_members:
                zf.close()
                raise ValueError("File .wacz không chứa archive WARC hợp lệ")
            target_member = "archive/data.warc.gz" if "archive/data.warc.gz" in warc_members else warc_members[0]
            print(f"[*] Đọc '{target_member}' từ file .wacz")
            return zf.open(target_member, "r"), zf

        # Trường hợp 3: File .warc hoặc .warc.gz thông thường
        return open(self.source_path, "rb"), None

    def is_tracker(self, url: str) -> bool:
        """Kiểm tra URL có thuộc domain tracker hoặc quảng cáo không."""
        url_lower = url.lower()
        return any(domain in url_lower for domain in DEFAULT_TRACKER_DOMAINS)

    def determine_category_and_ext(self, url: str, content_type: str) -> Tuple[str, str]:
        """Xác định danh mục tài nguyên và đuôi file chuẩn."""
        parsed = urlparse(url)
        path = unquote(parsed.path)
        ext = os.path.splitext(path)[1].lower()
        ctype = content_type.lower() if content_type else ""

        # 1. Âm thanh (Nhạc nền thiệp)
        if "audio/" in ctype or ext in [".mp3", ".wav", ".m4a", ".ogg", ".aac"]:
            return "audio", ext if ext in [".mp3", ".wav", ".m4a", ".ogg", ".aac"] else ".mp3"

        # 2. Phông chữ (Fonts)
        if (
            "font/" in ctype
            or "application/font" in ctype
            or "application/x-font" in ctype
            or ext in [".woff2", ".woff", ".ttf", ".otf", ".eot"]
        ):
            if "woff2" in ctype or ext == ".woff2":
                return "fonts", ".woff2"
            if "woff" in ctype or ext == ".woff":
                return "fonts", ".woff"
            if "ttf" in ctype or ext == ".ttf":
                return "fonts", ".ttf"
            if "otf" in ctype or ext == ".otf":
                return "fonts", ".otf"
            return "fonts", ext or ".woff2"

        # 3. Hình ảnh (Images)
        if "image/" in ctype or ext in [".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif", ".ico", ".avif"]:
            if "webp" in ctype or ext == ".webp":
                return "images", ".webp"
            if "png" in ctype or ext == ".png":
                return "images", ".png"
            if "jpeg" in ctype or "jpg" in ctype or ext in [".jpg", ".jpeg"]:
                return "images", ".jpg"
            if "svg" in ctype or ext == ".svg":
                return "images", ".svg"
            if "gif" in ctype or ext == ".gif":
                return "images", ".gif"
            if "icon" in ctype or ext == ".ico":
                return "images", ".ico"
            return "images", ext or ".webp"

        # 4. Dữ liệu JSON / API
        if "application/json" in ctype or "text/json" in ctype or ext == ".json":
            return "data", ".json"

        # 5. Trang HTML
        if "text/html" in ctype or ext in [".html", ".htm"]:
            return "pages", ".html"

        # 6. Stylesheet (CSS)
        if "text/css" in ctype or ext == ".css":
            return "styles", ".css"

        # 7. Javascript
        if "javascript" in ctype or ext == ".js":
            return "scripts", ".js"

        return "other", ext or ".bin"

    def clean_filename(self, url: str, ext: str, index: int) -> str:
        """Tạo tên file sạch, rõ ràng từ URL."""
        parsed = urlparse(url)
        path = unquote(parsed.path)
        base = os.path.basename(path.rstrip("/"))

        if not base or base == "/":
            base = f"item_{index:04d}"

        # Xóa các tham số hoặc ký tự không hợp lệ trong Windows/Linux
        base = re.sub(r'[\?\#\:\"\/\\\|\*\<\>]', "_", base)

        # Đảm bảo có đúng đuôi file
        if ext and not base.lower().endswith(ext.lower()):
            base = f"{base}{ext}"

        return base

    def extract(self) -> Dict[str, Any]:
        """Tiến hành giải nén toàn bộ archive."""
        stream, zf = self.resolve_warc_stream()
        print(f"[*] Bắt đầu giải nén tài nguyên vào: {self.output_dir}")

        # Chuẩn bị các thư mục đầu ra
        categories = ["images", "audio", "fonts", "data", "pages", "styles", "scripts", "other"]
        for cat in categories:
            (self.output_dir / cat).mkdir(parents=True, exist_ok=True)

        if self.mirror_full_url:
            (self.output_dir / "mirrored").mkdir(parents=True, exist_ok=True)

        used_filenames: Dict[str, int] = {}
        html_payloads: List[str] = []
        json_payloads: List[Dict[str, Any]] = []

        try:
            for record in ArchiveIterator(stream):
                self.stats["total_records"] += 1
                if record.rec_type != "response":
                    continue

                url = record.rec_headers.get_header("WARC-Target-URI")
                if not url:
                    continue

                # Lọc tracker
                if self.skip_trackers and self.is_tracker(url):
                    self.stats["skipped_trackers"] += 1
                    continue

                http_headers = record.http_headers
                if not http_headers:
                    continue

                status_code = http_headers.get_statuscode()
                # Chỉ lấy các phản hồi HTTP thành công
                if not status_code or int(status_code) not in [200, 206]:
                    continue

                content_type = http_headers.get_header("Content-Type") or ""
                content = record.content_stream().read()
                content_len = len(content)

                if content_len == 0:
                    continue

                category, ext = self.determine_category_and_ext(url, content_type)
                self.stats["processed_responses"] += 1
                self.stats["categories"][category] += 1
                self.stats["total_bytes"] += content_len

                # Xử lý tên file tránh trùng lặp
                raw_filename = self.clean_filename(url, ext, self.stats["processed_responses"])
                target_filename = raw_filename

                # Nếu đã có file cùng tên nhưng từ URL khác, thêm chỉ số đuôi
                if target_filename in used_filenames:
                    used_filenames[target_filename] += 1
                    stem = Path(raw_filename).stem
                    suffix = Path(raw_filename).suffix
                    target_filename = f"{stem}_{used_filenames[raw_filename]}{suffix}"
                else:
                    used_filenames[target_filename] = 1

                dest_file = self.output_dir / category / target_filename
                with open(dest_file, "wb") as f:
                    f.write(content)

                # Lưu phiên bản mirror nếu được yêu cầu
                if self.mirror_full_url:
                    parsed = urlparse(url)
                    mirror_path = self.output_dir / "mirrored" / parsed.netloc / parsed.path.lstrip("/")
                    mirror_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(mirror_path, "wb") as f:
                        f.write(content)

                # Thu thập dữ liệu để phân tích thông tin thiệp
                if category == "pages" and "demo" in url:
                    try:
                        html_payloads.append(content.decode("utf-8", errors="ignore"))
                    except Exception:
                        pass
                elif category == "data":
                    try:
                        data_obj = json.loads(content.decode("utf-8", errors="ignore"))
                        json_payloads.append({"url": url, "data": data_obj})
                    except Exception:
                        pass

                # Ghi nhận vào danh mục manifest
                self.manifest_items.append({
                    "url": url,
                    "category": category,
                    "filename": target_filename,
                    "rel_path": f"{category}/{target_filename}",
                    "content_type": content_type,
                    "size_bytes": content_len,
                    "http_status": int(status_code)
                })

        finally:
            stream.close()
            if zf:
                zf.close()

        # Phân tích thông tin thiệp cưới từ HTML / JSON đã thu thập
        self.parse_wedding_info(html_payloads, json_payloads)

        # Xuất manifest.json
        manifest_path = self.output_dir / "manifest.json"
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump({
                "source": str(self.source_path),
                "stats": self.stats,
                "wedding_metadata": self.wedding_metadata,
                "resources": self.manifest_items
            }, f, ensure_ascii=False, indent=2)

        # Xuất summary.md
        self.generate_summary_report()

        print(f"\n[+] Giải nén thành công!")
        print(f"    - Tổng số tài nguyên: {self.stats['processed_responses']} files ({self.stats['total_bytes'] / (1024*1024):.2f} MB)")
        print(f"    - Hình ảnh (images)  : {self.stats['categories']['images']}")
        print(f"    - Nhạc nền (audio)   : {self.stats['categories']['audio']}")
        print(f"    - Phông chữ (fonts)  : {self.stats['categories']['fonts']}")
        print(f"    - Dữ liệu JSON (data): {self.stats['categories']['data']}")
        print(f"    - Trang HTML (pages) : {self.stats['categories']['pages']}")
        print(f"    - Đã bỏ qua tracking : {self.stats['skipped_trackers']}")
        print(f"    - Báo cáo chi tiết   : {self.output_dir / 'summary.md'}")
        print(f"    - File Manifest      : {manifest_path}")

        return self.stats

    def parse_wedding_info(self, html_payloads: List[str], json_payloads: List[Dict[str, Any]]):
        """Phân tích và trích xuất dữ liệu mẫu thiệp cưới (Cô dâu chú rể, ngày giờ, địa điểm, nhạc)."""
        info: Dict[str, Any] = {
            "title": "",
            "groom": {},
            "bride": {},
            "event_time": {},
            "locations": [],
            "music": {},
            "timeline": [],
            "bank_accounts": [],
            "wishes_count": 0
        }

        def localized(value):
            if isinstance(value, dict):
                return value.get("vi") or value.get("en") or ""
            return value or ""

        def find_props(value):
            if isinstance(value, dict):
                initial = value.get("initialData")
                if isinstance(initial, dict) and isinstance(initial.get("data"), dict):
                    return value
                children = value.values()
            elif isinstance(value, list):
                children = value
            else:
                return None
            for child in children:
                found = find_props(child)
                if found is not None:
                    return found
            return None

        props = None
        html = html_payloads[0] if html_payloads else ""
        title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE)
        if title_match:
            info["title"] = title_match.group(1).strip()
        flight_chunks = []
        for match in re.finditer(r'self\.__next_f\.push\((\[.*?\])\)</script>', html, re.DOTALL):
            try:
                chunk = json.loads(match.group(1))
            except json.JSONDecodeError:
                continue
            if len(chunk) > 1 and chunk[0] == 1 and isinstance(chunk[1], str):
                flight_chunks.append(chunk[1])
        for line in "".join(flight_chunks).splitlines():
            _, separator, payload = line.partition(":")
            if not separator:
                continue
            try:
                value = json.loads(payload)
            except json.JSONDecodeError:
                continue
            props = find_props(value)
            if props is not None:
                break

        data = props["initialData"]["data"] if props else {}
        if data:
            with open(self.output_dir / "invitation_source.json", "w", encoding="utf-8") as f:
                json.dump(props, f, ensure_ascii=False, indent=2)
            for side in ("groom", "bride"):
                info[side] = {
                    "name": localized(data.get(side + "FullName")),
                    "role": localized(data.get(side + "Label")),
                    "parents": " & ".join(filter(None, [localized(data.get(side + "Father")), localized(data.get(side + "Mother"))])),
                    "address": localized(data.get(side + "Address"))
                }
            ceremonies = data.get("ceremonies") or []
            ceremony = ceremonies[0] if ceremonies else {}
            info["event_time"] = {
                "date": data.get("date"),
                "time_ceremony": ceremony.get("time"),
                "time_banquet": data.get("banquetTime") or data.get("time"),
                "ceremonies": ceremonies
            }
            info["locations"] = [{
                "type": "ceremony", "date": event.get("date"), "time": event.get("time"),
                "header": localized(event.get("header")),
                "address": localized(event.get("address") or data.get("ceremonyAddress"))
            } for event in ceremonies]
            info["locations"].append({
                "type": "banquet", "date": data.get("date"),
                "time": info["event_time"]["time_banquet"], "address": localized(data.get("address"))
            })
            info["timeline"] = data.get("timelineEvents") or []
            info["bank_accounts"] = [{
                "owner": method.get("accountName"), "for": method.get("for"),
                "bank": method.get("bankName"), "account_number": method.get("accountNumber")
            } for method in data.get("giftMethods", []) if method.get("type") == "vietqr"]
            info["wishes_count"] = len(props.get("staticComments") or [])
            info["gallery_images"] = data.get("galleryImages") or []
            info["dresscode_colors"] = data.get("dresscodeColors") or []
        else:
            print("[WARN] Invitation RSC data not found; unverified fields remain empty.")

        tracks = [item["data"]["track"] for item in json_payloads
                  if isinstance(item.get("data"), dict) and isinstance(item["data"].get("track"), dict)]
        selected = next((track for track in tracks if track.get("id") == data.get("musicTrackId")), None)
        if selected is not None:
            info["music"] = {key: selected.get(key) for key in ("id", "title", "artist", "url", "duration")}
        elif data.get("musicTrackId"):
            info["music"] = {"id": data["musicTrackId"]}

        self.wedding_metadata = info

        # Lưu file wedding_template_data.json
        with open(self.output_dir / "wedding_template_data.json", "w", encoding="utf-8") as f:
            json.dump(info, f, ensure_ascii=False, indent=2)

    def generate_summary_report(self):
        """Tạo file markdown summary.md tóm tắt kết quả trích xuất."""
        summary_path = self.output_dir / "summary.md"
        w = self.wedding_metadata
        music = w.get("music", {})
        groom = w.get("groom", {})
        bride = w.get("bride", {})

        content = f"""# Báo Cáo Trích Xuất Dữ Liệu Thiệp Cưới

- **Nguồn trích xuất:** `{self.source_path}`
- **Thời gian thực hiện:** {Path(summary_path).stat().st_mtime if summary_path.exists() else 'Vừa xong'}
- **Tổng dung lượng tài nguyên:** {self.stats['total_bytes'] / (1024*1024):.2f} MB
- **Tổng số tệp hợp lệ:** {self.stats['processed_responses']} files

---

## 1. Thống Kê Tài Nguyên

| Loại Tài Nguyên | Số Lượng Tệp | Thư Mục Lưu Trữ |
| :--- | :--- | :--- |
| **Hình ảnh (Images)** | `{self.stats['categories']['images']}` | `images/` |
| **Nhạc nền (Audio)** | `{self.stats['categories']['audio']}` | `audio/` |
| **Phông chữ (Fonts)** | `{self.stats['categories']['fonts']}` | `fonts/` |
| **Dữ liệu JSON (Data)** | `{self.stats['categories']['data']}` | `data/` |
| **Trang HTML (Pages)** | `{self.stats['categories']['pages']}` | `pages/` |
| **Mã CSS / JS** | `{self.stats['categories']['styles'] + self.stats['categories']['scripts']}` | `styles/`, `scripts/` |
| **Tracking bị loại bỏ** | `{self.stats['skipped_trackers']}` | *(Đã lọc sạch)* |

---

## 2. Thông Tin Thiệp Cưới Đã Nhận Diện

- **Tiêu đề mẫu thiệp:** {w.get('title', 'N/A')}
- **Chú rể:** {groom.get('name', 'N/A')} ({groom.get('role', '')}) - Phụ huynh: {groom.get('parents', '')}
- **Cô dâu:** {bride.get('name', 'N/A')} ({bride.get('role', '')}) - Phụ huynh: {bride.get('parents', '')}
- **Thời gian:** Ngày {w.get('event_time', {}).get('date', 'N/A')} ({w.get('event_time', {}).get('lunar_date', '')})
- **Nhạc nền:** **{music.get('title', 'N/A')}** - {music.get('artist', 'N/A')} (`{music.get('url', '')}`)

---

## 3. Hướng Dẫn Đẩy Lên MinIO & Database Dự Án

### Bước 1: Đẩy tài nguyên hình ảnh & âm thanh lên MinIO
Chạy lệnh đẩy các file trong `images/`, `audio/`, `fonts/` vào bucket `wedding-media`:
```powershell
# Ví dụ đẩy lên MinIO bằng MinIO Client (mc):
mc cp --recursive images/ local/wedding-media/templates/<template_code>/assets/
mc cp --recursive audio/ local/wedding-media/templates/<template_code>/audio/
mc cp --recursive fonts/ local/wedding-media/templates/<template_code>/fonts/
```

### Bước 2: Khởi tạo Template trong PostgreSQL
Sử dụng dữ liệu trong `wedding_template_data.json` và liên kết với các URL ảnh/nhạc từ MinIO để tạo record mới trong bảng `templates`.
"""
        with open(summary_path, "w", encoding="utf-8") as f:
            f.write(content)


def main():
    parser = argparse.ArgumentParser(
        description="Tool trích xuất tài nguyên từ web archive WARC / WACZ cho mẫu thiệp cưới."
    )
    parser.add_argument(
        "source",
        nargs="?",
        default="my-archiving-session",
        help="Đường dẫn file .warc, .warc.gz, .wacz hoặc thư mục chứa archive (Mặc định: 'my-archiving-session')"
    )
    parser.add_argument(
        "-o", "--output",
        default="extracted_templates",
        help="Thư mục xuất kết quả (Mặc định: 'extracted_templates')"
    )
    parser.add_argument(
        "--mirror",
        action="store_true",
        help="Giữ nguyên cấu trúc domain/path của các URL để duyệt offline"
    )
    parser.add_argument(
        "--include-trackers",
        action="store_true",
        help="Không bỏ qua các domain quảng cáo và theo dõi (Google Ads, Yandex...)"
    )

    args = parser.parse_args()

    extractor = TemplateExtractor(
        source_path=args.source,
        output_dir=args.output,
        skip_trackers=not args.include_trackers,
        mirror_full_url=args.mirror
    )

    try:
        extractor.extract()
    except Exception as e:
        print(f"\n[X] Lỗi trong quá trình trích xuất: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
