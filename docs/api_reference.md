# API Reference

## Authentication

### Login

**POST** `/v1/auth/login`

**Auth Required**: No

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Refresh Token

**POST** `/v1/auth/refresh`

**Auth Required**: Yes (Refresh Token)

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## User

### Get User Profile

**GET** `/v1/users/profile`

**Auth Required**: Yes

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "gender": "male",
  "birth_date": "1990-01-01",
  "preferences": {
    "style": "casual",
    "colors": ["blue", "black", "white"]
  }
}
```

### Update User Profile

**PATCH** `/v1/users/profile`

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "John Smith",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "preferences": {
    "style": "formal",
    "colors": ["navy", "gray", "white"]
  }
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Smith",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Get Body Profile

**GET** `/v1/users/body-profile`

**Auth Required**: Yes

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "height": 175,
  "weight": 70,
  "body_type": "athletic",
  "skin_tone": "warm",
  "measurements": {
    "chest": 96,
    "waist": 82,
    "hips": 92
  },
  "fit_preferences": "regular"
}
```

### Update Body Profile

**PATCH** `/v1/users/body-profile`

**Auth Required**: Yes

**Request Body**:
```json
{
  "height": 175,
  "weight": 70,
  "body_type": "athletic",
  "skin_tone": "warm",
  "measurements": {
    "chest": 96,
    "waist": 82,
    "hips": 92
  },
  "fit_preferences": "regular"
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "height": 175,
  "weight": 70,
  "body_type": "athletic",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

## Garment

### Get Garments

**GET** `/v1/garments`

**Auth Required**: Yes

**Query Parameters**:
- `category` (optional): Filter by category
- `brand` (optional): Filter by brand
- `color` (optional): Filter by color
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**:
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "name": "Classic White Shirt",
      "category": "tops",
      "subcategory": "shirt",
      "brand": "Uniqlo",
      "color": "white",
      "size": "M",
      "material": "cotton",
      "price": 29.99,
      "image_url": "https://example.com/shirt.jpg",
      "tags": ["casual", "work"],
      "condition": "new",
      "is_favorite": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

### Get Garment by ID

**GET** `/v1/garments/{id}`

**Auth Required**: Yes

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "name": "Classic White Shirt",
  "category": "tops",
  "subcategory": "shirt",
  "brand": "Uniqlo",
  "color": "white",
  "size": "M",
  "material": "cotton",
  "price": 29.99,
  "image_url": "https://example.com/shirt.jpg",
  "tags": ["casual", "work"],
  "condition": "new",
  "is_favorite": false,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

### Add Garment

**POST** `/v1/garments`

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "Classic White Shirt",
  "category": "tops",
  "subcategory": "shirt",
  "brand": "Uniqlo",
  "color": "white",
  "size": "M",
  "material": "cotton",
  "price": 29.99,
  "image_url": "https://example.com/shirt.jpg",
  "tags": ["casual", "work"],
  "condition": "new"
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "name": "Classic White Shirt",
  "category": "tops",
  "subcategory": "shirt",
  "brand": "Uniqlo",
  "color": "white",
  "size": "M",
  "material": "cotton",
  "price": 29.99,
  "image_url": "https://example.com/shirt.jpg",
  "tags": ["casual", "work"],
  "condition": "new",
  "is_favorite": false,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

### Update Garment

**PATCH** `/v1/garments/{id}`

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "Updated White Shirt",
  "tags": ["casual", "work", "updated"],
  "is_favorite": true
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "name": "Updated White Shirt",
  "tags": ["casual", "work", "updated"],
  "is_favorite": true,
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Delete Garment

**DELETE** `/v1/garments/{id}`

**Auth Required**: Yes

**Response**:
```json
{
  "message": "Garment deleted successfully"
}
```

## TryOn

### Create TryOn Session

**POST** `/v1/tryons`

**Auth Required**: Yes

**Request Body**:
```json
{
  "garment_ids": [
    "123e4567-e89b-12d3-a456-426614174002",
    "123e4567-e89b-12d3-a456-426614174003"
  ],
  "body_profile_id": "123e4567-e89b-12d3-a456-426614174001"
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174004",
  "session_id": "tryon_session_123",
  "garment_ids": [
    "123e4567-e89b-12d3-a456-426614174002",
    "123e4567-e89b-12d3-a456-426614174003"
  ],
  "body_profile_id": "123e4567-e89b-12d3-a456-426614174001",
  "status": "processing",
  "created_at": "2024-01-01T11:00:00Z"
}
```

### Get TryOn Results

**GET** `/v1/tryons/{id}/results`

**Auth Required**: Yes

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174004",
  "session_id": "tryon_session_123",
  "status": "completed",
  "ai_analysis": "The combination looks great! The white shirt pairs well with the blue jeans.",
  "confidence_score": 0.85,
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174005",
      "result_image_url": "https://example.com/tryon-result.jpg",
      "fit_analysis": {
        "overall_fit": "good",
        "areas_of_concern": [],
        "recommendations": ["Consider tucking the shirt"]
      },
      "rating": 4.5
    }
  ],
  "created_at": "2024-01-01T11:00:00Z",
  "updated_at": "2024-01-01T11:05:00Z"
}
```

### Rate TryOn Result

**POST** `/v1/tryons/{id}/rate`

**Auth Required**: Yes

**Request Body**:
```json
{
  "rating": 4.5,
  "feedback": "Great fit, love the combination!"
}
```

**Response**:
```json
{
  "message": "Rating submitted successfully",
  "rating": 4.5
}
```

## Outfit

### Get Outfits

**GET** `/v1/outfits`

**Auth Required**: Yes

**Query Parameters**:
- `occasion` (optional): Filter by occasion
- `season` (optional): Filter by season
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**:
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174006",
      "name": "Business Casual Look",
      "occasion": "work",
      "season": "spring",
      "weather": "mild",
      "ai_description": "Professional yet comfortable outfit perfect for office meetings.",
      "is_favorite": true,
      "likes_count": 25,
      "items": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174002",
          "name": "Classic White Shirt",
          "category": "tops",
          "display_order": 1
        },
        {
          "id": "123e4567-e89b-12d3-a456-426614174003",
          "name": "Navy Blue Chinos",
          "category": "bottoms",
          "display_order": 2
        }
      ],
      "created_at": "2024-01-01T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

### Create Outfit

**POST** `/v1/outfits`

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "Business Casual Look",
  "occasion": "work",
  "season": "spring",
  "weather": "mild",
  "garment_ids": [
    "123e4567-e89b-12d3-a456-426614174002",
    "123e4567-e89b-12d3-a456-426614174003"
  ]
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174006",
  "name": "Business Casual Look",
  "occasion": "work",
  "season": "spring",
  "weather": "mild",
  "ai_description": "Professional yet comfortable outfit perfect for office meetings.",
  "is_favorite": false,
  "likes_count": 0,
  "created_at": "2024-01-01T09:00:00Z",
  "updated_at": "2024-01-01T09:00:00Z"
}
```

### Update Outfit

**PATCH** `/v1/outfits/{id}`

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "Updated Business Look",
  "is_favorite": true
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174006",
  "name": "Updated Business Look",
  "is_favorite": true,
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Delete Outfit

**DELETE** `/v1/outfits/{id}`

**Auth Required**: Yes

**Response**:
```json
{
  "message": "Outfit deleted successfully"
}
```

## Files

### Upload File

**POST** `/v1/files/upload`

**Auth Required**: Yes

**Content-Type**: `multipart/form-data`

**Request Body**:
```
file: File (required) - The file to upload
category: string (required) - File category: "avatar", "garment", "tryon", "other"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174010",
    "filename": "user123/1704067200000_abc123.jpg",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "category": "garment",
    "cdnUrl": "https://cdn.pocket-stylist.com/user123/1704067200000_abc123.jpg",
    "thumbnailUrl": "https://imagedelivery.net/account/image-id/thumbnail",
    "variants": {
      "thumbnail": "https://imagedelivery.net/account/image-id/thumbnail",
      "small": "https://imagedelivery.net/account/image-id/small",
      "medium": "https://imagedelivery.net/account/image-id/medium",
      "large": "https://imagedelivery.net/account/image-id/large"
    },
    "processed": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### Get File

**GET** `/v1/files/{id}`

**Auth Required**: Yes

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174010",
    "filename": "user123/1704067200000_abc123.jpg",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "category": "garment",
    "cdnUrl": "https://cdn.pocket-stylist.com/user123/1704067200000_abc123.jpg",
    "thumbnailUrl": "https://imagedelivery.net/account/image-id/thumbnail",
    "variants": {
      "thumbnail": "https://imagedelivery.net/account/image-id/thumbnail",
      "small": "https://imagedelivery.net/account/image-id/small",
      "medium": "https://imagedelivery.net/account/image-id/medium",
      "large": "https://imagedelivery.net/account/image-id/large"
    },
    "processed": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### Delete File

**DELETE** `/v1/files/{id}`

**Auth Required**: Yes

**Response**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Get User Files

**GET** `/v1/files`

**Auth Required**: Yes

**Query Parameters**:
- `category` (optional): Filter by category ("avatar", "garment", "tryon", "other")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174010",
      "filename": "user123/1704067200000_abc123.jpg",
      "originalName": "photo.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "category": "garment",
      "cdnUrl": "https://cdn.pocket-stylist.com/user123/1704067200000_abc123.jpg",
      "thumbnailUrl": "https://imagedelivery.net/account/image-id/thumbnail",
      "variants": {
        "thumbnail": "https://imagedelivery.net/account/image-id/thumbnail",
        "small": "https://imagedelivery.net/account/image-id/small",
        "medium": "https://imagedelivery.net/account/image-id/medium",
        "large": "https://imagedelivery.net/account/image-id/large"
      },
      "processed": true,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

## Order

### Get Orders

**GET** `/v1/orders`

**Auth Required**: Yes

**Query Parameters**:
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**:
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174007",
      "order_number": "PS-2024-001",
      "status": "delivered",
      "total_amount": 89.97,
      "shipping_address": "123 Main St, Tokyo, Japan",
      "payment_method": "credit_card",
      "items": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174002",
          "name": "Classic White Shirt",
          "quantity": 2,
          "unit_price": 29.99,
          "total_price": 59.98
        },
        {
          "id": "123e4567-e89b-12d3-a456-426614174003",
          "name": "Navy Blue Chinos",
          "quantity": 1,
          "unit_price": 29.99,
          "total_price": 29.99
        }
      ],
      "shipped_at": "2024-01-02T10:00:00Z",
      "delivered_at": "2024-01-03T14:00:00Z",
      "created_at": "2024-01-01T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

### Create Order

**POST** `/v1/orders`

**Auth Required**: Yes

**Request Body**:
```json
{
  "items": [
    {
      "garment_id": "123e4567-e89b-12d3-a456-426614174002",
      "quantity": 2,
      "unit_price": 29.99
    },
    {
      "garment_id": "123e4567-e89b-12d3-a456-426614174003",
      "quantity": 1,
      "unit_price": 29.99
    }
  ],
  "shipping_address": "123 Main St, Tokyo, Japan",
  "payment_method": "credit_card"
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174007",
  "order_number": "PS-2024-001",
  "status": "pending",
  "total_amount": 89.97,
  "shipping_address": "123 Main St, Tokyo, Japan",
  "payment_method": "credit_card",
  "created_at": "2024-01-01T15:00:00Z",
  "updated_at": "2024-01-01T15:00:00Z"
}
```

### Get Order by ID

**GET** `/v1/orders/{id}`

**Auth Required**: Yes

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174007",
  "order_number": "PS-2024-001",
  "status": "delivered",
  "total_amount": 89.97,
  "shipping_address": "123 Main St, Tokyo, Japan",
  "payment_method": "credit_card",
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "name": "Classic White Shirt",
      "quantity": 2,
      "unit_price": 29.99,
      "total_price": 59.98
    }
  ],
  "shipped_at": "2024-01-02T10:00:00Z",
  "delivered_at": "2024-01-03T14:00:00Z",
  "created_at": "2024-01-01T15:00:00Z",
  "updated_at": "2024-01-03T14:00:00Z"
}
```

### Update Order Status

**PUT** `/v1/orders/{id}/status`

**Auth Required**: Yes

**Request Body**:
```json
{
  "status": "shipped"
}
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174007",
  "order_number": "PS-2024-001",
  "status": "shipped",
  "shipped_at": "2024-01-02T10:00:00Z",
  "updated_at": "2024-01-02T10:00:00Z"
}
```