# API Endpoints Documentation

This document describes the API endpoints for the Isaraya platform, including delivery missions, orders, and authentications.

---

## POST /delivery/missions

Create a new delivery mission.

- **Roles allowed:** CLIENT
- **Request Body:**

```json
{
  "orderId": "string (optional)",
  "pickupAddress": "string",
  "pickupLatitude": "number",
  "pickupLongitude": "number",
  "destinationAddress": "string",
  "destinationLatitude": "number",
  "destinationLongitude": "number"
}
```

- **Description:**  
  Creates a new delivery mission associated optionally with an order. The client ID is inferred from the authenticated user.

- **Example:**

```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "pickupAddress": "123 Rue de la Livraison, 75001 Paris, France",
  "pickupLatitude": 48.8566,
  "pickupLongitude": 2.3522,
  "destinationAddress": "456 Avenue du Client, 75002 Paris, France",
  "destinationLatitude": 48.8606,
  "destinationLongitude": 2.3376
}
```

---

## GET /delivery/missions/:id

Get details of a delivery mission by its ID.

- **Roles allowed:** ADMIN, CLIENT, DELIVER
- **Parameters:**

  - `id` (string): Mission ID

- **Description:**  
  Retrieves the details of a specific delivery mission by its unique identifier.

---

## GET /delivery/client/missions

Get all missions for the authenticated client.

- **Roles allowed:** CLIENT, ADMIN
- **Description:**  
  Retrieves all delivery missions created by the authenticated client.

---

## GET /delivery/livreur/missions

Get all missions assigned to the authenticated delivery person.

- **Roles allowed:** DELIVER, ADMIN
- **Description:**  
  Retrieves all delivery missions assigned to the authenticated delivery person.

---

## GET /delivery/missions/pending

Get all pending delivery missions.

- **Roles allowed:** DELIVER, ADMIN
- **Description:**  
  Retrieves all delivery missions that are currently pending acceptance.

---

## POST /delivery/missions/accept

Accept a delivery mission.

- **Roles allowed:** DELIVER
- **Request Body:**

```json
{
  "missionId": "string",
  "livreurId": "string"
}
```

- **Description:**  
  Allows a delivery person to accept a pending delivery mission. The `livreurId` is typically the authenticated user's ID.

- **Example:**

```json
{
  "missionId": "uuid-de-la-mission",
  "livreurId": "uuid-du-livreur"
}
```

---

## PUT /delivery/missions/status

Update the status of a delivery mission.

- **Roles allowed:** DELIVER, ADMIN
- **Request Body:**

```json
{
  "missionId": "string",
  "status": "string (one of the allowed mission statuses)"
}
```

- **Description:**  
  Updates the current status of a delivery mission.

- **Example:**

```json
{
  "missionId": "uuid-de-la-mission",
  "status": "IN_PROGRESS"
}
```

---

## PUT /delivery/missions/:id/position

Update the current position of a delivery mission.

- **Roles allowed:** DELIVER
- **Parameters:**
  - `id` (string): Mission ID
- **Request Body:**

```json
{
  "latitude": "number",
  "longitude": "number"
}
```

- **Description:**  
  Updates the current GPS position of the delivery person for the specified mission.

- **Example:**

```json
{
  "latitude": 14.6928,
  "longitude": -17.4467
}
```

---

# Orders Endpoints

## POST /orders

Create a new order.

- **Roles allowed:** All authenticated users
- **Request Body:**

```json
{
  "clientId": "string",
  "total": "number",
  "user": {
    "phone_number": "string",
    "first_name": "string",
    "last_name": "string"
  },
  "currency": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "location": {
    "street": "string",
    "city": "string",
    "postcode": "string",
    "country": "string",
    "latitude": "number",
    "longitude": "number"
  },
  "paymentMethod": "string",
  "items": [
    {
      "produitId": "string",
      "quantity": "number",
      "price": "number"
    }
  ]
}
```

- **Description:**  
  Creates a new order and initiates payment. Returns order details and payment URL.

- **Example:**

```json
{
  "clientId": "f4c9d13a-8d31-4d7c-9e2f-a1c68c98d789",
  "total": 15000,
  "user": {
    "phone_number": "+221771234567",
    "first_name": "Client",
    "last_name": "Test"
  },
  "currency": "XOF",
  "firstName": "Client",
  "lastName": "Test",
  "email": "client.test@example.com",
  "phone": "+221771234567",
  "location": {
    "street": "Commune de Sicap-Liberté 123 Rue de Ngor",
    "city": "Dakar",
    "postcode": "11000",
    "country": "Sénégal",
    "latitude": 14.6928,
    "longitude": -17.4467
  },
  "paymentMethod": "Orange Money",
  "items": [
    {
      "produitId": "prod-uuid-1",
      "quantity": 2,
      "price": 15000.0
    }
  ]
}
```

---

## POST /orders/initiate-payment

Initiate payment for an order.

- **Roles allowed:** All authenticated users
- **Request Body:** Payment initiation details
- **Description:**  
  Initiates payment process for an existing order.

---

## PUT /orders/status

Update the status of an order.

- **Roles allowed:** All authenticated users
- **Request Body:**

```json
{
  "orderId": "string",
  "status": "string"
}
```

- **Description:**  
  Updates the status of an order.

---

## GET /orders

Get all orders.

- **Roles allowed:** All authenticated users
- **Description:**  
  Retrieves all orders.

---

## GET /orders/client/:clientId

Get orders by client ID.

- **Roles allowed:** All authenticated users
- **Parameters:**
  - `clientId` (string): Client ID
- **Description:**  
  Retrieves all orders for a specific client.

---

## GET /orders/merchant

Get orders for the authenticated merchant.

- **Roles allowed:** MERCHANT
- **Description:**  
  Retrieves all orders received by the authenticated merchant.

---

## GET /orders/:id

Get order by ID.

- **Roles allowed:** All authenticated users
- **Parameters:**
  - `id` (string): Order ID
- **Description:**  
  Retrieves details of a specific order.

---

## POST /orders/payment/webhook

Handle PayTech IPN webhook.

- **Roles allowed:** Public (no auth required)
- **Description:**  
  Processes payment notifications from PayTech.

---

## GET /orders/payment/status/:ref

Get payment status and resume URL.

- **Roles allowed:** All authenticated users
- **Parameters:**
  - `ref` (string): Payment reference
- **Description:**  
  Retrieves the status of a payment and provides resume URL if needed.

---

## POST /orders/payment/resume

Resume an unfinished payment.

- **Roles allowed:** All authenticated users
- **Request Body:**

```json
{
  "ref": "string"
}
```

- **Description:**  
  Resumes a payment that was not completed.

---

# Authentications Endpoints

## POST /auth/register

Register a new user.

- **Roles allowed:** Public
- **Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string"
}
```

- **Description:**  
  Creates a new user account and sends verification email.

- **Example:**

```json
{
  "firstName": "Fatou",
  "lastName": "Diallo",
  "email": "fatou@example.com",
  "password": "password123",
  "phone": "+221771234567"
}
```

---

## POST /auth/login

Authenticate a user.

- **Roles allowed:** Public
- **Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

- **Description:**  
  Logs in a user and returns a JWT token.

- **Example:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## GET /auth/verify-email

Verify user email.

- **Roles allowed:** Public
- **Query Parameters:**
  - `token` (string): Verification token
- **Description:**  
  Verifies the user's email address using the token from the email.

---

## POST /auth/resend-verification

Resend verification email.

- **Roles allowed:** Public
- **Request Body:**

```json
{
  "email": "string"
}
```

- **Description:**  
  Resends the verification email to the user.

---

## POST /auth/request-password-reset

Request password reset.

- **Roles allowed:** Public
- **Request Body:**

```json
{
  "email": "string"
}
```

- **Description:**  
  Sends a password reset email to the user.

---

## POST /auth/reset-password

Reset password.

- **Roles allowed:** Public
- **Request Body:**

```json
{
  "token": "string",
  "newPassword": "string"
}
```

- **Description:**  
  Resets the user's password using the reset token.

---

## GET /auth/reset-password

Redirect to frontend reset password page.

- **Roles allowed:** Public
- **Query Parameters:**
  - `token` (string): Reset token
- **Description:**  
  Redirects to the frontend password reset page.

---

## GET /auth/profile

Get user profile.

- **Roles allowed:** All authenticated users
- **Description:**  
  Retrieves the profile of the authenticated user.

---

## PUT /auth/profile

Update user profile.

- **Roles allowed:** All authenticated users
- **Request Body:** Profile update data
- **Description:**  
  Updates the profile information of the authenticated user.

---

## POST /auth/merchant/profile

Create merchant profile.

- **Roles allowed:** MERCHANT
- **Request Body:** Merchant profile data
- **Description:**  
  Creates a merchant profile for the authenticated user.

---

## PUT /auth/merchant/profile

Update merchant profile.

- **Roles allowed:** MERCHANT
- **Request Body:** Merchant profile update data
- **Description:**  
  Updates the merchant profile of the authenticated user.

---

## GET /auth/merchant/profile

Get merchant profile.

- **Roles allowed:** MERCHANT
- **Description:**  
  Retrieves the merchant profile of the authenticated user.

---

## GET /auth/merchant/profiles

Get all merchant profiles (Admin).

- **Roles allowed:** ADMIN
- **Query Parameters:**
  - `status` (string, optional): Filter by status
- **Description:**  
  Retrieves all merchant profiles, optionally filtered by status.

---

## PUT /auth/merchant/profile/:merchantId/validate

Validate merchant profile (Admin).

- **Roles allowed:** ADMIN
- **Parameters:**
  - `merchantId` (string): Merchant profile ID
- **Request Body:** Validation data
- **Description:**  
  Validates or rejects a merchant profile.

---

## GET /auth/admin/stats

Get admin statistics.

- **Roles allowed:** ADMIN
- **Description:**  
  Retrieves comprehensive statistics for the platform.

---

## GET /auth/admin/users

Get all users (Admin).

- **Roles allowed:** ADMIN
- **Description:**  
  Retrieves a list of all users on the platform.

---

## PATCH /auth/admin/merchant-profiles/:merchantId/validate

Validate merchant profile (Admin alternative).

- **Roles allowed:** ADMIN
- **Parameters:**
  - `merchantId` (string): Merchant profile ID
- **Request Body:** Validation data
- **Description:**  
  Alternative endpoint for validating merchant profiles.

---

## PATCH /auth/admin/users/:id

Update user (Admin).

- **Roles allowed:** ADMIN
- **Parameters:**
  - `id` (string): User ID
- **Request Body:** User update data
- **Description:**  
  Updates user information, including suspension/reactivation.

---

# Payments Endpoints

## POST /orders/initiate-payment

Initiate payment for an order.

- **Roles allowed:** All authenticated users
- **Request Body:**

```json
{
  "orderId": "string",
  "amount": "number",
  "currency": "string",
  "description": "string",
  "customer": {
    "name": "string",
    "email": "string",
    "phone": "string"
  }
}
```

- **Description:**  
  Initiates payment process for an existing order using PayTech payment gateway. Returns redirect URL for payment completion.

- **Example:**

```json
{
  "orderId": "order-uuid-123",
  "amount": 15000,
  "currency": "XOF",
  "description": "Commande Isaraya #123",
  "customer": {
    "name": "Fatou Diallo",
    "email": "fatou@example.com",
    "phone": "+221771234567"
  }
}
```

---

## POST /orders/payment/webhook

Handle PayTech IPN webhook.

- **Roles allowed:** Public (no auth required)
- **Request Body:** PayTech IPN data
- **Description:**  
  Processes Instant Payment Notification (IPN) from PayTech payment gateway. Updates order status based on payment confirmation.

---

## GET /orders/payment/status/:ref

Get payment status and resume URL.

- **Roles allowed:** All authenticated users
- **Parameters:**
  - `ref` (string): Payment reference
- **Description:**  
  Retrieves the current status of a payment and provides resume URL if payment was not completed.

- **Response Example:**

```json
{
  "status": "PENDING_PAYMENT",
  "redirectUrl": "https://paytech.sn/payment/redirect/abc123",
  "token": "payment-token-123"
}
```

---

## POST /orders/payment/resume

Resume an unfinished payment.

- **Roles allowed:** All authenticated users
- **Request Body:**

```json
{
  "ref": "string"
}
```

- **Description:**  
  Resumes a payment that was initiated but not completed. Returns the payment redirect URL.

- **Example:**

```json
{
  "ref": "payment-ref-123"
}
```

---

# Data Transfer Objects (DTOs)

## CreateMissionDto

| Property             | Type   | Description                           | Example                                        | Required |
| -------------------- | ------ | ------------------------------------- | ---------------------------------------------- | -------- |
| orderId              | string | ID of the associated order (optional) | "123e4567-e89b-12d3-a456-426614174000"         | No       |
| pickupAddress        | string | Pickup address                        | "123 Rue de la Livraison, 75001 Paris, France" | Yes      |
| pickupLatitude       | number | Latitude of pickup point              | 48.8566                                        | Yes      |
| pickupLongitude      | number | Longitude of pickup point             | 2.3522                                         | Yes      |
| destinationAddress   | string | Destination address                   | "456 Avenue du Client, 75002 Paris, France"    | Yes      |
| destinationLatitude  | number | Latitude of destination point         | 48.8606                                        | Yes      |
| destinationLongitude | number | Longitude of destination point        | 2.3376                                         | Yes      |

## AcceptMissionDto

| Property  | Type   | Description               | Example              | Required |
| --------- | ------ | ------------------------- | -------------------- | -------- |
| missionId | string | ID of the mission         | "uuid-de-la-mission" | Yes      |
| livreurId | string | ID of the delivery person | "uuid-du-livreur"    | Yes      |

## UpdateStatusDto

| Property  | Type   | Description                  | Example              | Required |
| --------- | ------ | ---------------------------- | -------------------- | -------- |
| missionId | string | ID of the mission            | "uuid-de-la-mission" | Yes      |
| status    | string | Status of the mission (enum) | "IN_PROGRESS"        | Yes      |

## PositionDto

| Property  | Type   | Description          | Example  | Required |
| --------- | ------ | -------------------- | -------- | -------- |
| latitude  | number | Latitude coordinate  | 14.6928  | Yes      |
| longitude | number | Longitude coordinate | -17.4467 | Yes      |

---

This concludes the API endpoints documentation for the Isaraya platform.
