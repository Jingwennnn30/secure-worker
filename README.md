# secure-worker
Cloudflare Worker for Zero Trust protected /secure endpoint


This repository contains the Cloudflare Worker used in the Customer Solutions Engineer technical assignment.


The Worker is deployed on a Cloudflare Tunnel–protected path and integrates with Cloudflare Zero Trust Access and R2 Object Storage.


## Functionality
- Serves a protected `/secure` endpoint behind Cloudflare Zero Trust Access
- Reads authenticated user email from Cloudflare Access headers
- Displays authentication timestamp
- Displays client country as a clickable link
- Serves country flag images from a private Cloudflare R2 bucket


## Routes
- `/secure`
Returns an HTML page displaying:
- Authenticated user email
- Authentication timestamp
- Client country (clickable)


- `/secure/{COUNTRY}`
Returns the corresponding country flag image from a private R2 bucket
(example: `/secure/MY`)


## Storage
- Cloudflare R2 (private bucket)
- R2 binding name: `FLAGS_BUCKET`


## Notes
The Worker is attached to the route:
`tunnel.jingwen-cloud.com/secure`
