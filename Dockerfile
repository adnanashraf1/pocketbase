FROM alpine:latest

ARG PB_VERSION=0.30.0

# Install needed tools
RUN apk add --no-cache unzip curl ca-certificates

# Set working directory
WORKDIR /pb

# Download and unzip PocketBase
RUN curl -L -o pb.zip https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pb.zip \
    && rm pb.zip

# Expose PocketBase port
EXPOSE 8080

# Persist PocketBase data
VOLUME ["/pb/pb_data"]

# Start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
