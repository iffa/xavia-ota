# Storage & Database Configuration

## Supported Storage Providers

Xavia OTA supports multiple storage backends for storing update assets. Configure using `BLOB_STORAGE_TYPE`.

### Supabase Storage

```env
BLOB_STORAGE_TYPE=supabase
SUPABASE_URL=your-project-url
SUPABASE_API_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=expo-updates
```

- Requires a Supabase project with storage enabled
- Bucket should be created manually before starting the server

### Local Storage

```env
BLOB_STORAGE_TYPE=local
```

- Stores files directly on the server filesystem
- Useful for development or single-server deployments
- Ensure the path has proper write permissions

### Azure Blob Storage

You can start a blob storage emulator locally by running `docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 mcr.microsoft.com/azure-storage/azurite`.

```env
# Provide a connection string:
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;

# ...or use DefaultAzureCredentials:
AZURE_STORAGE_ACCOUNT_URL=http://127.0.0.1:10000/devstoreaccount1
```

## Supported Database Providers

Database configuration is managed via `DB_TYPE`.

### Supabase Database

```env
DB_TYPE=supabase
SUPABASE_URL=your-project-url
SUPABASE_API_KEY=your-service-role-key
```

- Uses Supabase's PostgreSQL database
- Tables should be created manually before starting the server. Refer to the `containers/database/schema` folder for reference.

### PostgreSQL

```env
DB_TYPE=postgres
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_DB=your-database-name
POSTGRES_HOST=your-host
POSTGRES_PORT=your-port
```

- Direct PostgreSQL connection
- Supports any PostgreSQL-compatible database
- Tables should be created manually before starting the server. Refer to the `containers/database/schema` folder for reference.
