import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@techshop.com" },
    update: {
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      id: "admin-fixed-id",
      name: "Admin",
      email: "admin@techshop.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Sample products
  const products = [
    {
      name: "Dell XPS 15 Laptop",
      description: "15.6-inch OLED display, Intel Core i7, 16GB RAM, 512GB SSD. Perfect for professionals.",
      price: 1499.99,
      image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
      category: "Laptops",
      stock: 12,
      discount: 10,
    },
    {
      name: "Apple MacBook Pro 14\"",
      description: "M3 Pro chip, 18GB RAM, 512GB SSD. Exceptional performance for creatives.",
      price: 1999.99,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
      category: "Laptops",
      stock: 8,
      discount: 0,
    },
    {
      name: "Custom Gaming Desktop",
      description: "RTX 4070, AMD Ryzen 9, 32GB DDR5, 1TB NVMe SSD. Built for gaming.",
      price: 1299.99,
      image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600",
      category: "Desktops",
      stock: 5,
      discount: 15,
    },
    {
      name: "LG UltraWide 34\" Monitor",
      description: "34-inch curved IPS, 144Hz, 1ms response, WQHD resolution.",
      price: 699.99,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
      category: "Monitors",
      stock: 20,
      discount: 5,
    },
    {
      name: "Logitech MX Keys Keyboard",
      description: "Wireless mechanical keyboard with smart illumination and multi-device support.",
      price: 109.99,
      image: "https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=600",
      category: "Accessories",
      stock: 50,
      discount: 0,
    },
    {
      name: "Logitech MX Master 3 Mouse",
      description: "Advanced wireless mouse with MagSpeed scroll, 8K DPI, ergonomic design.",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
      category: "Accessories",
      stock: 40,
      discount: 0,
    },
  ];

  const productsCount = await prisma.product.count();
  if (productsCount === 0) {
    await prisma.product.createMany({ data: products });
  }

  // Sample offer
  await prisma.offer.upsert({
    where: { code: "SUMMER20" },
    update: {
      title: "Summer Sale",
      description: "Get 20% off on all laptops this summer!",
      discount: 20,
      expiresAt: new Date("2025-09-01"),
      active: true,
    },
    create: {
      title: "Summer Sale",
      description: "Get 20% off on all laptops this summer!",
      discount: 20,
      code: "SUMMER20",
      expiresAt: new Date("2025-09-01"),
      active: true,
    },
  });

  // CMS core content
  await prisma.cmsContent.upsert({
    where: { key: "home" },
    update: {
      title: "Power your work and play with the right tech",
      body: "TechShop provides curated laptops, desktops, monitors, and accessories with expert support and competitive pricing.",
    },
    create: {
      key: "home",
      title: "Power your work and play with the right tech",
      body: "TechShop provides curated laptops, desktops, monitors, and accessories with expert support and competitive pricing.",
    },
  });

  await prisma.cmsContent.upsert({
    where: { key: "about" },
    update: {
      title: "About TechShop",
      body: "TechShop is a customer-first electronics store focused on reliable products, transparent pricing, and responsive support.",
    },
    create: {
      key: "about",
      title: "About TechShop",
      body: "TechShop is a customer-first electronics store focused on reliable products, transparent pricing, and responsive support.",
    },
  });

  await prisma.cmsContent.upsert({
    where: { key: "services" },
    update: {
      title: "Our Services",
      body: "Product consultation, office and home setup, device upgrades, and dependable post-purchase technical assistance.",
    },
    create: {
      key: "services",
      title: "Our Services",
      body: "Product consultation, office and home setup, device upgrades, and dependable post-purchase technical assistance.",
    },
  });

  await prisma.portfolioProject.upsert({
    where: { slug: "skyline-residences" },
    update: {
      title: "Campus Computer Lab Upgrade",
      summary: "A full hardware refresh for a university lab with better performance and lower maintenance overhead.",
      details:
        "TechShop supplied and configured laptops, monitors, and accessories for a 60-seat computer lab, improving boot times, software stability, and student productivity.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900",
    },
    create: {
      slug: "skyline-residences",
      title: "Campus Computer Lab Upgrade",
      summary: "A full hardware refresh for a university lab with better performance and lower maintenance overhead.",
      details:
        "TechShop supplied and configured laptops, monitors, and accessories for a 60-seat computer lab, improving boot times, software stability, and student productivity.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900",
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "how-to-plan-a-digital-launch" },
    update: {
      title: "How to Choose the Right Laptop for Work, Study, or Gaming",
      excerpt: "A practical guide to CPU, RAM, storage, and GPU choices based on real usage.",
      content:
        "Start with your primary workload, then match CPU class, memory, and storage accordingly. Prioritize upgradeability, battery life, and warranty support for long-term value.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900",
      published: true,
    },
    create: {
      slug: "how-to-plan-a-digital-launch",
      title: "How to Choose the Right Laptop for Work, Study, or Gaming",
      excerpt: "A practical guide to CPU, RAM, storage, and GPU choices based on real usage.",
      content:
        "Start with your primary workload, then match CPU class, memory, and storage accordingly. Prioritize upgradeability, battery life, and warranty support for long-term value.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900",
      published: true,
    },
  });

  await prisma.newsPost.upsert({
    where: { slug: "agency-opens-new-regional-office" },
    update: {
      title: "TechShop Expands Product Line for Creators and Gamers",
      excerpt: "New high-refresh monitors, mechanical keyboards, and performance laptops are now available.",
      content:
        "The new lineup includes creator-grade displays, low-latency peripherals, and workstation-class laptops backed by local warranty support.",
      image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=900",
      published: true,
    },
    create: {
      slug: "agency-opens-new-regional-office",
      title: "TechShop Expands Product Line for Creators and Gamers",
      excerpt: "New high-refresh monitors, mechanical keyboards, and performance laptops are now available.",
      content:
        "The new lineup includes creator-grade displays, low-latency peripherals, and workstation-class laptops backed by local warranty support.",
      image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=900",
      published: true,
    },
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
