export const SERVICES = [
  { id: 'signature-cut', category: 'hair', name: 'Signature Cut & Style', duration: 60, price: 65, desc: 'Consultation, precision cut, wash and a blow-dry finish tailored to your face shape.', popular: true },
  { id: 'balayage', category: 'hair', name: 'Hand-Painted Balayage', duration: 180, price: 220, desc: 'Soft, sun-kissed dimension painted freehand, finished with a gloss and toner.', popular: true },
  { id: 'gloss', category: 'hair', name: 'Gloss & Tone Refresh', duration: 45, price: 55, desc: 'Revive faded color and add mirror-like shine between full color appointments.' },
  { id: 'keratin', category: 'hair', name: 'Keratin Smoothing', duration: 150, price: 260, desc: 'Frizz-free, glossy hair for up to 12 weeks. Formaldehyde-free formula.' },
  { id: 'hydra-facial', category: 'skin', name: 'Hydra Glow Facial', duration: 60, price: 120, desc: 'Deep cleanse, gentle extraction and a hyaluronic infusion for an instant glow.', popular: true },
  { id: 'peel', category: 'skin', name: 'Brightening Enzyme Peel', duration: 45, price: 95, desc: 'Fruit-enzyme exfoliation that softens texture and evens tone with zero downtime.' },
  { id: 'lift', category: 'skin', name: 'Sculpt & Lift Massage', duration: 50, price: 110, desc: 'Gua sha and lymphatic techniques that de-puff and define the jawline.' },
  { id: 'gel-mani', category: 'nails', name: 'Gel Manicure', duration: 45, price: 45, desc: 'Shaping, cuticle care and chip-resistant gel in over 120 shades.' },
  { id: 'nail-art', category: 'nails', name: 'Custom Nail Art', duration: 75, price: 70, desc: 'Chrome, French, florals or your own Pinterest board brought to life.' },
  { id: 'spa-pedi', category: 'nails', name: 'Rose Spa Pedicure', duration: 60, price: 60, desc: 'Rose-petal soak, sugar scrub, hot-towel wrap and polish of your choice.' },
  { id: 'bridal', category: 'makeup', name: 'Bridal Makeup', duration: 120, price: 280, desc: 'Trial session plus a long-wear look for your big day, lashes included.', popular: true },
  { id: 'glam', category: 'makeup', name: 'Evening Glam', duration: 60, price: 90, desc: 'Camera-ready makeup for parties, shoots and every big night out.' },
  { id: 'brow', category: 'makeup', name: 'Brow Lamination & Tint', duration: 45, price: 65, desc: 'Fuller, brushed-up brows that hold their shape for six weeks.' },
  { id: 'lash-lift', category: 'makeup', name: 'Lash Lift & Tint', duration: 50, price: 75, desc: 'A natural curl and deeper tint for lashes that look extended, no extensions needed.' },
];

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'hair', label: 'Hair' },
  { id: 'skin', label: 'Skin' },
  { id: 'nails', label: 'Nails' },
  { id: 'makeup', label: 'Makeup & Brows' },
];

export const STYLISTS = [
  { id: 'any', name: 'No preference', role: 'First available artist', initials: '✦' },
  { id: 'amara', name: 'Amara Okafor', role: 'Founder · Color specialist', initials: 'AO' },
  { id: 'lena', name: 'Lena Moreau', role: 'Senior stylist', initials: 'LM' },
  { id: 'priya', name: 'Priya Shah', role: 'Skin therapist', initials: 'PS' },
  { id: 'sofia', name: 'Sofia Reyes', role: 'Nail & makeup artist', initials: 'SR' },
];

export const formatDuration = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ');
};