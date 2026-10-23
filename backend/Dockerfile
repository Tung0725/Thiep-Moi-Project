# ==========================================
# Stage 1: Build JAR using Maven & JDK 21
# ==========================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package application
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Minimal Runtime Environment
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Run as non-root user for container security (OWASP recommendation)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built JAR from builder stage
COPY --from=builder --chown=appuser:appgroup /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
