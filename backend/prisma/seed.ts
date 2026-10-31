import { PrismaClient, RoleType, JobPriority, JobStatus, MachineStatus, EventState } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting DRP Production Seed Script ---');

  // 1. Roles & Users
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System Administrator with full operational privileges',
    },
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'OPERATOR' },
    update: {},
    create: {
      name: 'OPERATOR',
      description: 'Machine floor operator with print monitoring access',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@drp.com' },
    update: {},
    create: {
      email: 'admin@drp.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      name: 'Amar Singh',
      role: RoleType.ADMIN,
      active: true,
    },
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@drp.com' },
    update: {},
    create: {
      email: 'operator@drp.com',
      passwordHash: bcrypt.hashSync('op123', 10),
      name: 'Rajesh Kumar',
      role: RoleType.OPERATOR,
      active: true,
    },
  });

  console.log('Seeded Users:', adminUser.email, operatorUser.email);

  // 2. All Seven Machines (Machines.pptx)
  const machineSeeds = [
    {
      id: 'M01',
      name: 'Colorjet SoniQ Solvent',
      model: 'RIP: SAi PhotoPRINT · Print: SAi PhotoPRINT',
      vendor: 'Colorjet',
      software: 'SAi PhotoPRINT / Production Manager',
      pilot: true,
      status: MachineStatus.LIVE,
      outputToday: 8420,
      totalOutput: 184500,
      utilizationPct: 78,
      integrationNotes: 'Documented queues and XML/CSV job log; pilot candidate',
    },
    {
      id: 'M02',
      name: 'Colorjet Verve UV',
      model: 'RIP: Gama Print · Print: RYPC Print',
      vendor: 'Colorjet',
      software: 'Gama Print / RYPC Print',
      pilot: false,
      status: MachineStatus.LIVE,
      outputToday: 6250,
      totalOutput: 94200,
      utilizationPct: 64,
      integrationNotes: 'Vendor interface to verify',
    },
    {
      id: 'M03',
      name: 'NegiSign UV',
      model: 'RIP: PSN9 Select · Print: NegiSign',
      vendor: 'NegiSign',
      software: 'PSN9 Select / NegiSign',
      pilot: false,
      status: MachineStatus.LIVE,
      outputToday: 4180,
      totalOutput: 87100,
      utilizationPct: 51,
      integrationNotes: 'Vendor interface to verify',
    },
    {
      id: 'M04',
      name: 'Caldron Eco Solvent',
      model: 'RIP: Maintop · Print: PrintExp',
      vendor: 'Caldron',
      software: 'Maintop / PrintExp',
      pilot: false,
      status: MachineStatus.LIVE,
      outputToday: 3960,
      totalOutput: 112000,
      utilizationPct: 42,
      integrationNotes: 'Logs/export/API to verify',
    },
    {
      id: 'M05',
      name: 'HP Latex 730',
      model: 'RIP: SAi PhotoPRINT · Print: SAi PhotoPRINT',
      vendor: 'HP',
      software: 'SAi PhotoPRINT / Production Manager',
      pilot: false,
      status: MachineStatus.IDLE,
      outputToday: 0,
      totalOutput: 45000,
      utilizationPct: 0,
      integrationNotes: 'Pilot excluded',
    },
    {
      id: 'M06',
      name: 'Audley 10ft Roll to Roll UV',
      model: 'RIP: MainTop · Print: PrintExp_64',
      vendor: 'Audley',
      software: 'MainTop / PrintExp_64',
      pilot: false,
      status: MachineStatus.LIVE,
      outputToday: 5650,
      totalOutput: 145000,
      utilizationPct: 82,
      integrationNotes: 'Logs/export/API to verify',
    },
    {
      id: 'M07',
      name: 'HP Latex 1500',
      model: 'RIP: ONYX · Print: ONYX',
      vendor: 'HP',
      software: 'ONYX',
      pilot: false,
      status: MachineStatus.ERROR,
      outputToday: 0,
      totalOutput: 62000,
      utilizationPct: 0,
      integrationNotes: 'Pilot excluded · connection timeout',
    },
  ];

  for (const m of machineSeeds) {
    await prisma.machine.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  }
  console.log('Seeded all 7 machines.');

  // 3. Customers
  const custNorthstar = await prisma.customer.upsert({
    where: { id: 'cust-1' },
    update: {},
    create: {
      id: 'cust-1',
      name: 'Northstar Retail',
      dealer: 'Ludhiana Central',
      phone: '+91 98140 12345',
    },
  });

  const custUrban = await prisma.customer.upsert({
    where: { id: 'cust-2' },
    update: {},
    create: {
      id: 'cust-2',
      name: 'Urban Mart',
      dealer: 'Mohali Phase 7',
      phone: '+91 98765 43210',
    },
  });

  // 4. Materials (Roll widths: 3, 4, 5, 6, 8, 10 ft)
  const materialSeeds = [
    { name: 'Flex 3 ft', category: 'roll', rollWidthFt: 3, purchaseQty: 20, purchasePrice: 650, costPerRoll: 650, costPerSqft: 2.16, currentStock: 12, reorderLevel: 4, unit: 'Rolls' },
    { name: 'Flex 4 ft', category: 'roll', rollWidthFt: 4, purchaseQty: 15, purchasePrice: 780, costPerRoll: 780, costPerSqft: 1.95, currentStock: 9, reorderLevel: 4, unit: 'Rolls' },
    { name: 'Flex 5 ft', category: 'roll', rollWidthFt: 5, purchaseQty: 10, purchasePrice: 950, costPerRoll: 950, costPerSqft: 1.90, currentStock: 6, reorderLevel: 3, unit: 'Rolls' },
    { name: 'Flex 6 ft', category: 'roll', rollWidthFt: 6, purchaseQty: 10, purchasePrice: 1150, costPerRoll: 1150, costPerSqft: 1.91, currentStock: 5, reorderLevel: 3, unit: 'Rolls' },
    { name: 'Flex 8 ft', category: 'roll', rollWidthFt: 8, purchaseQty: 8, purchasePrice: 1450, costPerRoll: 1450, costPerSqft: 1.81, currentStock: 4, reorderLevel: 2, unit: 'Rolls' },
    { name: 'Flex 10 ft', category: 'roll', rollWidthFt: 10, purchaseQty: 5, purchasePrice: 1750, costPerRoll: 1750, costPerSqft: 1.75, currentStock: 2, reorderLevel: 2, unit: 'Rolls' },
  ];

  for (const mat of materialSeeds) {
    await prisma.material.upsert({
      where: { name: mat.name },
      update: mat,
      create: mat,
    });
  }

  // 5. Inks
  const inkSeeds = [
    { name: 'CMYK Ink', type: 'ink', purchaseQty: 100, purchasePrice: 850, costPerLitre: 850, currentStock: 42, reorderLevel: 15 },
    { name: 'White Ink', type: 'ink', purchaseQty: 25, purchasePrice: 920, costPerLitre: 920, currentStock: 8, reorderLevel: 10 },
    { name: 'Violet Ink', type: 'ink', purchaseQty: 30, purchasePrice: 1100, costPerLitre: 1100, currentStock: 16, reorderLevel: 6 },
  ];

  for (const ink of inkSeeds) {
    await prisma.inkProduct.upsert({
      where: { name: ink.name },
      update: ink,
      create: ink,
    });
  }

  // 6. Ink Heads
  await prisma.inkHead.upsert({
    where: { id: 'head-dx5-1' },
    update: {},
    create: {
      id: 'head-dx5-1',
      model: 'Epson DX5 Print Head',
      manufacturer: 'Epson',
      purchasePrice: 48500,
      expectedLifespanSqft: 500000,
      usedLifespanSqft: 125400,
      costPerSqft: 0.097,
      machineId: 'M01',
      status: 'Active',
    },
  });

  console.log('Seeded Materials, Inks and Ink Heads.');
  console.log('--- Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
