# No Mess Express — Junk Removal & Hauling

Website for No Mess Express (Sparks, NV). Static HTML/CSS/JS — deploys straight to Vercel, no build step.

No Mess Express 🚛 Junk removal & hauling in Reno, Sparks, Fernley, Carson City, Lemon Valley & Red Rock. Message us for a free quote!

## Pages
- `index.html` — home: services, how it works, items we haul, service areas map, why us, FAQ
- `contact.html` — contact info + interactive free-estimate builder

## Edit client details
Everything lives in the `CONFIG` object at the top of `script.js`:
- `phone`, `phoneRaw`, `email` — **placeholders, replace with the client's real info**
- `booksy` — booking link
- `formEndpoint` — optional Formspree/Web3Forms URL to receive estimate requests by email (blank = opens an email draft)
- `loads`, `extras`, `areaFees` — estimate pricing (placeholder rates, confirm with client)

Built by [Nexora Digital](https://www.nexoradigital.live).
