'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { downloadCsv } from '../lib/api';

// Initial Data Seeds Matching Approved Prototype
const INITIAL_MACHINES = [
  { id: 'M01', name: 'Colorjet SoniQ Solvent', model: 'RIP: SAi PhotoPRINT · Print: SAi PhotoPRINT', software: 'SAi PhotoPRINT / Production Manager', vendor: 'Colorjet', pilot: true, status: 'live', output: 8420, util: 78, job: 'DRP-26084', last: 'Demo · 3 sec ago', integration: 'History/API access to verify' },
  { id: 'M02', name: 'Colorjet Verve UV', model: 'RIP: Gama Print · Print: RYPC Print', software: 'Gama Print / RYPC Print', vendor: 'Colorjet', pilot: false, status: 'live', output: 6250, util: 64, job: 'DRP-26087', last: 'Demo · 2 sec ago', integration: 'Vendor interface to verify' },
  { id: 'M03', name: 'NegiSign UV', model: 'RIP: PSN9 Select · Print: NegiSign', software: 'PSN9 Select / NegiSign', vendor: 'NegiSign', pilot: false, status: 'live', output: 4180, util: 51, job: 'DRP-26091', last: 'Demo · 4 sec ago', integration: 'Vendor interface to verify' },
  { id: 'M04', name: 'Caldron Eco Solvent', model: 'RIP: Maintop · Print: PrintExp', software: 'Maintop / PrintExp', vendor: 'Caldron', pilot: false, status: 'live', output: 3960, util: 42, job: 'DRP-26082', last: 'Demo · 5 sec ago', integration: 'Logs/export/API to verify' },
  { id: 'M05', name: 'HP Latex 730', model: 'RIP: SAi PhotoPRINT · Print: SAi PhotoPRINT', software: 'SAi PhotoPRINT / Production Manager', vendor: 'HP', pilot: false, status: 'idle', output: 0, util: 0, job: 'No active job', last: 'Demo · Idle', integration: 'Pilot excluded' },
  { id: 'M06', name: 'Audley 10ft Roll to Roll UV', model: 'RIP: MainTop · Print: PrintExp_64', software: 'MainTop / PrintExp_64', vendor: 'Audley', pilot: false, status: 'live', output: 5650, util: 82, job: 'DRP-26089', last: 'Demo · 2 sec ago', integration: 'Logs/export/API to verify' },
  { id: 'M07', name: 'HP Latex 1500', model: 'RIP: ONYX · Print: ONYX', software: 'ONYX', vendor: 'HP', pilot: false, status: 'error', output: 0, util: 0, job: 'Connection lost', last: 'Demo · 2 min ago', integration: 'Pilot excluded' }
];

const DEFAULT_ART_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20x2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23e6ebff%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23c9f4eb%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22url%28%23g%29%22/%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%22136%22%20height%3D%2276%22%20rx%3D%228%22%20fill%3D%22%23fff%22%20opacity%3D%22.72%22/%3E%3Cpath%20d%3D%22M22%2067%20L55%2036%20L78%2057%20L98%2043%20L138%2076%20L22%2076Z%22%20fill%3D%22%237588dc%22/%3E%3Ccircle%20cx%3D%22118%22%20cy%3D%2230%22%20r%3D%229%22%20fill%3D%22%23f0b65c%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2294%22%20font-size%3D%227%22%20text-anchor%3D%22middle%22%20fill%3D%22%2353617c%22%3EARTWORK%20PREVIEW%3C/text%3E%3C/svg%3E';

const INITIAL_JOBS = [
  { id: 'DRP-26084', art: 'dealer_banner_oct.tif', artworkImage: DEFAULT_ART_IMAGE, customer: 'Northstar Retail', dealer: 'Ludhiana Central', machine: 'M01', required: 10000, produced: 8420, status: 'Printing', priority: 'Normal', dims: '4 × 8 ft', date: '2026-10-29', format: 'TIFF', ink: 2.1, materialCost: 1450, inkCost: 680, waste: 110 },
  { id: 'DRP-26087', art: 'festive_promo_v3.svg', artworkImage: DEFAULT_ART_IMAGE, customer: 'Urban Mart', dealer: 'Mohali Phase 7', machine: 'M02', required: 8000, produced: 6250, status: 'Printing', priority: 'Urgent', dims: '3 × 6 ft', date: '2026-10-29', format: 'SVG', ink: 1.7, materialCost: 980, inkCost: 550, waste: 85 },
  { id: 'DRP-26091', art: 'winter_sale_front.tif', artworkImage: DEFAULT_ART_IMAGE, customer: 'Northstar Retail', dealer: 'Zirakpur', machine: 'M03', required: 5000, produced: 5200, status: 'Overrun', priority: 'Urgent', dims: '4 × 4 ft', date: '2026-10-29', format: 'TIFF', ink: 1.4, materialCost: 760, inkCost: 420, waste: 200 },
  { id: 'DRP-26082', art: 'storefront_panel_02.tif', artworkImage: DEFAULT_ART_IMAGE, customer: 'Metro Wholesale', dealer: 'Chandigarh 17', machine: 'M04', required: 6000, produced: 3960, status: 'Printing', priority: 'Normal', dims: '8 × 10 ft', date: '2026-10-29', format: 'TIFF', ink: 1.8, materialCost: 1800, inkCost: 590, waste: 90 },
  { id: 'DRP-26089', art: 'clearance_window.svg', artworkImage: DEFAULT_ART_IMAGE, customer: 'Value Avenue', dealer: 'Panchkula', machine: 'M06', required: 4000, produced: 4630, status: 'Overrun', priority: 'Urgent', dims: '3 × 8 ft', date: '2026-10-29', format: 'SVG', ink: 1.6, materialCost: 820, inkCost: 510, waste: 160 },
  { id: 'DRP-26078', art: 'brand_wall_final.tif', artworkImage: DEFAULT_ART_IMAGE, customer: 'BluePeak Foods', dealer: 'Industrial Area', machine: 'M01', required: 3000, produced: 3000, status: 'Completed', priority: 'Normal', dims: '6 × 8 ft', date: '2026-10-28', format: 'TIFF', ink: 1.2, materialCost: 920, inkCost: 390, waste: 40 },
  { id: 'DRP-26080', art: 'menu_board_set.svg', artworkImage: DEFAULT_ART_IMAGE, customer: 'Cafe 24', dealer: 'Sector 24', machine: 'M02', required: 2500, produced: 0, status: 'Pending', priority: 'Normal', dims: '2 × 3 ft', date: '2026-10-29', format: 'SVG', ink: 0, materialCost: 0, inkCost: 0, waste: 0 },
  { id: 'DRP-26076', art: 'outlet_directional.tif', artworkImage: DEFAULT_ART_IMAGE, customer: 'Metro Wholesale', dealer: 'Ambala Road', machine: 'M05', required: 4500, produced: 0, status: 'Pending', priority: 'Normal', dims: '3 × 5 ft', date: '2026-10-29', format: 'TIFF', ink: 0, materialCost: 0, inkCost: 0, waste: 0 }
];

const INITIAL_COST_ITEMS = [
  { name: 'CMYK Ink', category: 'Ink', basis: 'Per litre', purchase: 850, rate: 850 },
  { name: 'White Ink', category: 'Ink', basis: 'Per litre', purchase: 920, rate: 920 },
  { name: 'Violet Ink', category: 'Ink', basis: 'Per litre', purchase: 1100, rate: 1100 },
  { name: 'DX5 Print Head', category: 'Ink head', basis: 'Per head / estimated life', purchase: 48500, rate: 48500 },
  { name: 'Flex 3 ft', category: 'Material', basis: 'Per roll', purchase: 650, rate: 650 },
  { name: 'Flex 4 ft', category: 'Material', basis: 'Per roll', purchase: 780, rate: 780 },
  { name: 'Flex 5 ft', category: 'Material', basis: 'Per roll', purchase: 950, rate: 950 },
  { name: 'Flex 6 ft', category: 'Material', basis: 'Per roll', purchase: 1150, rate: 1150 },
  { name: 'Flex 8 ft', category: 'Material', basis: 'Per roll', purchase: 1450, rate: 1450 },
  { name: 'Flex 10 ft', category: 'Material', basis: 'Per roll', purchase: 1750, rate: 1750 }
];

const INITIAL_STOCK = [
  { name: 'CMYK Ink', type: 'ink', qty: 42, unit: 'Litres', cost: 850, min: 15 },
  { name: 'White Ink', type: 'ink', qty: 8, unit: 'Litres', cost: 920, min: 10 },
  { name: 'Violet Ink', type: 'ink', qty: 16, unit: 'Litres', cost: 1100, min: 6 },
  { name: 'Flex 3 ft', type: 'roll', qty: 12, unit: 'Rolls', cost: 650, min: 4 },
  { name: 'Flex 4 ft', type: 'roll', qty: 9, unit: 'Rolls', cost: 780, min: 4 },
  { name: 'Flex 5 ft', type: 'roll', qty: 6, unit: 'Rolls', cost: 950, min: 3 },
  { name: 'Flex 6 ft', type: 'roll', qty: 5, unit: 'Rolls', cost: 1150, min: 3 },
  { name: 'Flex 8 ft', type: 'roll', qty: 4, unit: 'Rolls', cost: 1450, min: 2 },
  { name: 'Flex 10 ft', type: 'roll', qty: 2, unit: 'Rolls', cost: 1750, min: 2 }
];

const INITIAL_PRINT_EVENTS = [
  { time: '09:42:18', machine: 'M01', file: 'dealer_banner_oct.tif', job: 'DRP-26084', type: 'Print queue event', qty: 'Copies: 1 · layout unknown', verification: 'Physical output unverified', state: 'Matched', key: 'evt-001' },
  { time: '09:39:51', machine: 'M02', file: 'festive_promo_v3.svg', job: 'DRP-26087', type: 'Job completed record', qty: 'Copies: 1', verification: 'Software record only', state: 'Matched', key: 'evt-002' },
  { time: '09:34:02', machine: 'M04', file: 'storefront_panel_02.tif', job: 'DRP-26082', type: 'Queue event', qty: 'Quantity unavailable', verification: 'Needs counter comparison', state: 'Unmatched', key: 'evt-003' },
  { time: '09:32:47', machine: 'M01', file: 'dealer_banner_oct.tif', job: 'DRP-26084', type: 'Repeated history row', qty: 'Same event fingerprint', verification: 'Not counted twice', state: 'Duplicate blocked', key: 'evt-001' }
];

const INITIAL_PRINTEXP_JOBS = [
  { id: 'PX-1042', name: 'dealer_banner_oct.prn', job: 'DRP-26089', machine: 'M06', dpi: '720 × 1800', size: '10 × 4 ft', progress: 76, x: 2, y: 2, status: 'Printing', loaded: '10:42:18', actual: '—', record: 'Loaded from PRN' },
  { id: 'PX-1043', name: 'retail_promo_02.prn', job: 'DRP-26091', machine: 'M03', dpi: '600 × 1200', size: '6 × 3 ft', progress: 0, x: 1, y: 3, status: 'Loaded', loaded: '10:39:04', actual: '—', record: 'Awaiting start' },
  { id: 'PX-1038', name: 'seasonal_banner.prn', job: 'DRP-26084', machine: 'M06', dpi: '720 × 1800', size: '8 × 4 ft', progress: 100, x: 2, y: 2, status: 'Finished', loaded: '09:18:22', actual: '09:31:46', record: 'Print Finish' },
  { id: 'PX-1037', name: 'dealer_test_strip.prn', job: 'DRP-26082', machine: 'M04', dpi: '720 × 1200', size: '4 × 2 ft', progress: 35, x: 1, y: 2, status: 'Cancelled', loaded: '08:52:11', actual: '09:02:07', record: 'Cancelled by operator' },
  { id: 'PX-1035', name: 'event_backdrop.prn', job: 'DRP-26079', machine: 'M06', dpi: '720 × 1800', size: '10 × 8 ft', progress: 100, x: 3, y: 2, status: 'Finished', loaded: '08:14:03', actual: '08:28:50', record: 'Print Finish' }
];

export default function DrpMonitoringSystem() {
  // Navigation
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Data States
  const [machines, setMachines] = useState(INITIAL_MACHINES);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [costItems, setCostItems] = useState(INITIAL_COST_ITEMS);
  const [printEvents, setPrintEvents] = useState(INITIAL_PRINT_EVENTS);
  const [pxJobs, setPxJobs] = useState(INITIAL_PRINTEXP_JOBS);
  const [pxSelectedId, setPxSelectedId] = useState('PX-1042');

  const [ledger, setLedger] = useState([
    { material: 'CMYK Ink', movement: 'Purchase', qty: '+20 L', time: 'Today, 09:15' },
    { material: 'Flex 4 ft', movement: 'Usage · M02', qty: '−2 rolls', time: 'Today, 08:52' },
    { material: 'White Ink', movement: 'Usage · M06', qty: '−1.5 L', time: 'Today, 08:30' },
    { material: 'Flex 8 ft', movement: 'Purchase', qty: '+3 rolls', time: 'Yesterday' }
  ]);

  const [alerts, setAlerts] = useState([
    { id: 'a1', type: 'red', title: 'Production overrun detected', desc: 'DRP-26091 · winter_sale_front.tif exceeded target by 200 pcs.', time: '2 min ago', read: false },
    { id: 'a2', type: 'red', title: 'Production overrun detected', desc: 'DRP-26089 · clearance_window.svg exceeded target by 630 pcs.', time: '8 min ago', read: false },
    { id: 'a3', type: 'amber', title: 'Machine connection lost', desc: 'HP Latex 1500 (M07) has not sent a heartbeat for 2 minutes.', time: '2 min ago', read: false },
    { id: 'a4', type: 'amber', title: 'Low ink stock', desc: 'White Ink is below the configured minimum reserve.', time: 'Today, 08:15', read: true }
  ]);

  const [activity, setActivity] = useState([
    { title: 'Print counter updated', desc: 'Colorjet SoniQ Solvent · DRP-26084 · +120 pcs', time: '3 sec ago' },
    { title: 'Job marked urgent', desc: 'DRP-26087 · Urban Mart', time: '12 min ago' },
    { title: 'Artwork detected', desc: 'festive_promo_v3.svg · server history', time: '18 min ago' },
    { title: 'Stock purchase recorded', desc: 'CMYK Ink · +20 litres', time: '45 min ago' }
  ]);

  // Filters
  const [jobSearch, setJobSearch] = useState('');
  const [jobMachine, setJobMachine] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [artSearch, setArtSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [costFilter, setCostFilter] = useState('today');
  const [pxSearch, setPxSearch] = useState('');
  const [pxFilter, setPxFilter] = useState('');
  const [eventMachineFilter, setEventMachineFilter] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('');
  const [chartRange, setChartRange] = useState('7');

  // Reports
  const [reportFrom, setReportFrom] = useState('2026-10-29');
  const [reportTo, setReportTo] = useState('2026-10-29');
  const [reportMachine, setReportMachine] = useState('');
  const [reportType, setReportType] = useState('production');

  // Modals & Forms
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState<any | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalType, setStockModalType] = useState<'ink' | 'roll'>('ink');
  const [stockModalMaterial, setStockModalMaterial] = useState('CMYK Ink');

  // Job Form Inputs
  const [fJob, setFJob] = useState('');
  const [fQty, setFQty] = useState('');
  const [fArtwork, setFArtwork] = useState('');
  const [fCustomer, setFCustomer] = useState('');
  const [fDealer, setFDealer] = useState('');
  const [fMachine, setFMachine] = useState('M01');
  const [fDimensions, setFDimensions] = useState('4 × 8 ft');
  const [fPriority, setFPriority] = useState('Normal');
  const [fNotes, setFNotes] = useState('');
  const [fArtworkImage, setFArtworkImage] = useState<string | null>(null);

  // Stock Form Inputs
  const [stockQty, setStockQty] = useState('10');
  const [stockUnit, setStockUnit] = useState('Litres');
  const [stockCost, setStockCost] = useState('850');
  const [stockMovement, setStockMovement] = useState('Purchase');

  // Workflow State
  const [wfStep, setWfStep] = useState(0);
  const [wfJobId, setWfJobId] = useState('DRP-26084');
  const [wfMachineId, setWfMachineId] = useState('M06');
  const [wfLogs, setWfLogs] = useState([
    { stage: 0, time: '09:31:04', title: 'Artwork record matched', desc: 'Sample event · filename matched to DRP-26084' }
  ]);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<any>(null);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3200);
  };

  const fmt = (n: number | string) => Number(n || 0).toLocaleString('en-IN');
  const machineName = (id: string) => machines.find((m) => m.id === id)?.name || id;
  const balance = (j: any) => j.required - j.produced;

  const statusClass = (s: string) => (s === 'Overrun' ? 'red' : s === 'Completed' ? 'green' : s === 'Pending' ? '' : 'amber');
  const statusPill = (s: string) => (
    <span className={`pill ${statusClass(s)}`}>
      {s === 'Printing' ? '● ' : ''}
      {s}
    </span>
  );

  // PrintExp Selected Job Calculation: Planned Copies = X * Y
  const pxSelectedJob = useMemo(() => {
    return pxJobs.find((j) => j.id === pxSelectedId) || pxJobs[0];
  }, [pxJobs, pxSelectedId]);

  const pxCopies = (j: any) => Math.max(1, Number(j.x) || 1) * Math.max(1, Number(j.y) || 1);

  // Workflow Steps
  const wfSteps = [
    { title: 'Artwork available on network', detail: 'Artwork detected in \\\\MACHINEROOM date-wise folder.', event: 'Artwork detected on network folder', desc: 'Sample artwork record discovered and matched to the selected job.' },
    { title: 'File staged on local G: drive', detail: 'File copied to the matching local date folder.', event: 'Local staging record', desc: 'Simulated file path: G:\\2026\\October\\29\\dealer_banner_oct.tif' },
    { title: 'MainTop RIP processed', detail: 'Artwork imported; size, rotation, scale, resolution and pass settings applied.', event: 'RIP processing record', desc: 'MainTop processing marked complete in demo; no software was contacted.' },
    { title: '.PRN output generated', detail: 'RIP output saved for PrintExp.', event: 'PRN output record', desc: 'Sample output: dealer_banner_oct.prn' },
    { title: 'PrintExp job loaded / command issued', detail: 'Job loaded; margins, heads, speed and direction configured.', event: 'PrintExp job event', desc: 'Command event is not proof that physical pieces were produced.' },
    { title: 'Production count reconciled', detail: 'Compare required target, available counter and verified physical output.', event: 'Production reconciliation', desc: 'Demo output reconciled at 760 of 1,000; physical counter remains unverified.' }
  ];

  const advanceWorkflow = () => {
    if (wfStep >= wfSteps.length) {
      toast('Demo workflow complete. Reset to run it again.');
      return;
    }
    const st = wfSteps[wfStep];
    setWfLogs((prev) => [
      { stage: wfStep, time: new Date().toLocaleTimeString('en-GB'), title: st.event, desc: st.desc },
      ...prev
    ]);
    const next = wfStep + 1;
    setWfStep(next);
    if (next === wfSteps.length) {
      setActivity((prev) => [{ title: 'Demo workflow completed', desc: `${wfJobId} · ${machineName(wfMachineId)}`, time: 'Just now' }, ...prev]);
      toast('Workflow demo complete. Physical output is still unverified.');
    } else {
      toast('Demo step recorded: ' + st.title);
    }
  };

  const resetWorkflow = () => {
    setWfStep(0);
    setWfLogs([{ stage: 0, time: new Date().toLocaleTimeString('en-GB'), title: 'Workflow demo reset', desc: 'Ready to step through the simulated process again.' }]);
    toast('Workflow demo reset.');
  };

  // Job Modal Handlers
  const openJobModal = (id: string | null = null) => {
    setEditingJobId(id);
    if (id) {
      const j = jobs.find((x) => x.id === id);
      if (j) {
        setFJob(j.id);
        setFQty(String(j.required));
        setFArtwork(j.art);
        setFCustomer(j.customer);
        setFDealer(j.dealer || '');
        setFMachine(j.machine);
        setFDimensions(j.dims || '4 × 8 ft');
        setFPriority(j.priority);
        setFArtworkImage(j.artworkImage || DEFAULT_ART_IMAGE);
      }
    } else {
      setFJob(`DRP-${26092 + jobs.length}`);
      setFQty('5000');
      setFArtwork('');
      setFCustomer('');
      setFDealer('');
      setFMachine('M01');
      setFDimensions('4 × 8 ft');
      setFPriority('Normal');
      setFNotes('');
      setFArtworkImage(null); // Force upload requirement
    }
    setIsJobModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFArtworkImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveJob = (e: React.FormEvent) => {
    e.preventDefault();
    // MANDATORY ARTWORK IMAGE CHECK
    if (!fArtworkImage) {
      toast('Artwork image is mandatory. Upload an image before saving the job.');
      return;
    }
    const id = fJob.trim();
    const existing = jobs.find((j) => j.id === (editingJobId || id));

    const newJobItem = {
      id,
      art: fArtwork.trim() || 'artwork.tif',
      artworkImage: fArtworkImage,
      customer: fCustomer.trim(),
      dealer: fDealer.trim() || '—',
      machine: fMachine,
      required: Number(fQty) || 1000,
      produced: existing?.produced || 0,
      status: existing?.status || 'Pending',
      priority: fPriority,
      dims: fDimensions || 'Not specified',
      date: existing?.date || '2026-10-29',
      format: (fArtwork || '').toLowerCase().endsWith('.svg') ? 'SVG' : 'TIFF',
      ink: existing?.ink || 0,
      materialCost: existing?.materialCost || 0,
      inkCost: existing?.inkCost || 0,
      waste: existing?.waste || 0
    };

    if (existing) {
      setJobs((prev) => prev.map((j) => (j.id === existing.id ? { ...j, ...newJobItem } : j)));
      toast('Job updated successfully.');
    } else {
      if (jobs.some((x) => x.id === id)) {
        toast('Job number already exists. Choose a unique number.');
        return;
      }
      setJobs((prev) => [newJobItem, ...prev]);
      setActivity((prev) => [{ title: 'New production job created', desc: `${id} · ${newJobItem.art}`, time: 'Just now' }, ...prev]);
      toast('Production job created successfully.');
    }
    setIsJobModalOpen(false);
  };

  // Stock Purchase / Movement Modal
  const openStockModal = (type: 'ink' | 'roll', materialName?: string) => {
    setStockModalType(type);
    setStockModalMaterial(materialName || (type === 'ink' ? 'CMYK Ink' : 'Flex 4 ft'));
    setStockUnit(type === 'ink' ? 'Litres' : 'Rolls');
    setStockCost(type === 'ink' ? '850' : '780');
    setStockQty('10');
    setStockMovement('Purchase');
    setIsStockModalOpen(true);
  };

  const saveStockEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(stockQty) || 1;
    const cost = Number(stockCost) || 0;
    setStock((prev) => {
      const idx = prev.findIndex((s) => s.name === stockModalMaterial);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + q, cost: cost || copy[idx].cost };
        return copy;
      } else {
        return [...prev, { name: stockModalMaterial, type: stockModalType, qty: q, unit: stockUnit, cost, min: 2 }];
      }
    });

    setLedger((prev) => [{ material: stockModalMaterial, movement: stockMovement, qty: `+${q} ${stockUnit}`, time: 'Just now' }, ...prev]);
    setActivity((prev) => [{ title: 'Stock entry recorded', desc: `${stockModalMaterial} · +${q} ${stockUnit}`, time: 'Just now' }, ...prev]);
    setIsStockModalOpen(false);
    toast('Stock entry saved. Inventory balances updated.');
  };

  // Counter simulation on job
  const simulateJobCounter = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const produced = j.produced + 120;
          const status = produced > j.required ? 'Overrun' : produced >= j.required ? 'Completed' : 'Printing';
          return { ...j, produced, status };
        }
        return j;
      })
    );
    setMachines((prev) =>
      prev.map((m) => {
        const matchingJob = jobs.find((j) => j.id === id);
        if (matchingJob && m.id === matchingJob.machine) {
          return { ...m, output: m.output + 120, util: Math.min(100, m.util + 1), last: 'Just now', status: 'live' };
        }
        return m;
      })
    );
    setActivity((prev) => [{ title: 'Print counter updated (simulated)', desc: `${id} · +120 pcs`, time: 'Just now' }, ...prev]);
    toast('Demo counter updated by 120 pieces. No physical machine was contacted.');
  };

  const toggleUrgent = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const next = j.priority === 'Urgent' ? 'Normal' : 'Urgent';
          return { ...j, priority: next };
        }
        return j;
      })
    );
    toast('Job priority updated.');
  };

  const simulatePrintEvent = () => {
    const key = `evt-demo-${Date.now()}`;
    const newEv = {
      time: new Date().toLocaleTimeString('en-GB'),
      machine: 'M01',
      file: 'dealer_banner_oct.tif',
      job: 'DRP-26084',
      type: 'Simulated queue event',
      qty: 'Copies: 1 · sample only',
      verification: 'Physical output unverified',
      state: 'Matched',
      key
    };
    setPrintEvents((prev) => [newEv, ...prev]);
    setActivity((prev) => [{ title: 'Simulated print event received', desc: 'M01 · DRP-26084 · demo only', time: 'Just now' }, ...prev]);
    toast('Simulated event added. No printer or software was contacted.');
  };

  // Cost Config Modal Handlers
  const addCostRate = (type: 'ink' | 'head' | 'material') => {
    const label = type === 'ink' ? 'ink' : type === 'head' ? 'ink head' : 'material';
    const name = prompt(`Enter ${label} name:`);
    if (!name) return;
    const purchase = Number(prompt(`Enter purchase cost (₹):`, '0'));
    if (!Number.isFinite(purchase) || purchase < 0) {
      toast('Enter a valid purchase cost.');
      return;
    }
    const basis = type === 'ink' ? 'Per litre' : type === 'head' ? 'Per head / estimated life' : 'Per roll';
    setCostItems((prev) => [
      ...prev,
      { name, category: type === 'ink' ? 'Ink' : type === 'head' ? 'Ink head' : 'Material', basis, purchase, rate: purchase }
    ]);
    toast(`${label} cost item added.`);
  };

  // Filtered views
  const filteredJobs = useMemo(() => {
    const s = jobSearch.toLowerCase();
    return jobs.filter(
      (j) =>
        `${j.id} ${j.art} ${j.customer} ${j.dealer}`.toLowerCase().includes(s) &&
        (!jobMachine || j.machine === jobMachine) &&
        (!jobStatus || j.status === jobStatus)
    );
  }, [jobs, jobSearch, jobMachine, jobStatus]);

  const filteredPrintExpHistory = useMemo(() => {
    const s = pxSearch.toLowerCase();
    return pxJobs.filter(
      (j) =>
        (['Finished', 'Cancelled', 'Loaded'].includes(j.status)) &&
        `${j.name} ${j.job} ${j.id}`.toLowerCase().includes(s) &&
        (!pxFilter || j.status === pxFilter)
    );
  }, [pxJobs, pxSearch, pxFilter]);

  const filteredStock = useMemo(() => {
    const s = stockSearch.toLowerCase();
    return stock.filter((item) => (!stockFilter || item.type === stockFilter) && item.name.toLowerCase().includes(s));
  }, [stock, stockSearch, stockFilter]);

  const filteredEvents = useMemo(() => {
    return printEvents.filter(
      (e) => (!eventMachineFilter || e.machine === eventMachineFilter) && (!eventStatusFilter || e.state === eventStatusFilter)
    );
  }, [printEvents, eventMachineFilter, eventStatusFilter]);

  // Exports
  const exportJobsCsv = () => {
    downloadCsv(
      'drp-production-jobs.csv',
      ['Job Number', 'Artwork', 'Customer', 'Dealer', 'Machine', 'Required Qty', 'Produced Qty', 'Balance', 'Status', 'Priority', 'Dimensions'],
      jobs.map((j) => [j.id, j.art, j.customer, j.dealer || '—', machineName(j.machine), j.required, j.produced, balance(j), j.status, j.priority, j.dims])
    );
    toast('Jobs CSV exported successfully.');
  };

  const exportCostingCsv = () => {
    downloadCsv(
      'drp-costing-wastage.csv',
      ['Job Number', 'Artwork', 'Produced', 'Material Cost INR', 'Ink Litres', 'Ink Cost INR', 'Wastage Pieces', 'Total Cost INR'],
      jobs.map((j) => [j.id, j.art, j.produced, j.materialCost, j.ink, j.inkCost, j.waste, j.materialCost + j.inkCost])
    );
    toast('Costing CSV exported.');
  };

  const exportPrintExpCsv = () => {
    downloadCsv(
      'drp-printexp-job-history.csv',
      ['PrintExp ID', 'Job Number', 'PRN File', 'Machine', 'Status', 'DPI', 'Size', 'X Copies', 'Y Copies', 'Planned Copies', 'Loaded Time', 'Finish/Event Time', 'History Record'],
      pxJobs.map((j) => [j.id, j.job, j.name, machineName(j.machine), j.status, j.dpi, j.size, j.x, j.y, pxCopies(j), j.loaded, j.actual, j.record])
    );
    toast('PrintExp history CSV exported.');
  };

  return (
    <div className="app">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="brand">
          <div className="logo">D</div>
          <div>
            <strong>
              DRP <span style={{ color: '#8b9bff' }}>PORTAL</span>
            </strong>
            <small>PRINT OPERATIONS SUITE</small>
          </div>
        </div>

        <div className="navlabel">WORKSPACE</div>
        <nav className="nav">
          <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => { setCurrentPage('dashboard'); setSidebarOpen(false); }}>
            <span className="ico">▦</span>Overview
          </button>
          <button className={currentPage === 'jobs' ? 'active' : ''} onClick={() => { setCurrentPage('jobs'); setSidebarOpen(false); }}>
            <span className="ico">▤</span>Production jobs
            <span className="count">{jobs.filter((j) => j.status === 'Pending' || j.status === 'Printing').length}</span>
          </button>
          <button className={currentPage === 'machines' ? 'active' : ''} onClick={() => { setCurrentPage('machines'); setSidebarOpen(false); }}>
            <span className="ico">▣</span>Machine monitor
          </button>
          <button className={currentPage === 'events' ? 'active' : ''} onClick={() => { setCurrentPage('events'); setSidebarOpen(false); }}>
            <span className="ico">⇄</span>Print event monitor
          </button>
          <button className={currentPage === 'workflow' ? 'active' : ''} onClick={() => { setCurrentPage('workflow'); setSidebarOpen(false); }}>
            <span className="ico">⟳</span>RIP → Print workflow <span className="count">NEW</span>
          </button>
          <button className={currentPage === 'printexp' ? 'active' : ''} onClick={() => { setCurrentPage('printexp'); setSidebarOpen(false); }}>
            <span className="ico">▤</span>PrintExp jobs <span className="count">LIVE DEMO</span>
          </button>
          <button className={currentPage === 'artwork' ? 'active' : ''} onClick={() => { setCurrentPage('artwork'); setSidebarOpen(false); }}>
            <span className="ico">▧</span>Artwork library
          </button>
        </nav>

        <div className="navlabel">OPERATIONS</div>
        <nav className="nav">
          <button className={currentPage === 'inventory' ? 'active' : ''} onClick={() => { setCurrentPage('inventory'); setSidebarOpen(false); }}>
            <span className="ico">◫</span>Ink & material stock
          </button>
          <button className={currentPage === 'costing' ? 'active' : ''} onClick={() => { setCurrentPage('costing'); setSidebarOpen(false); }}>
            <span className="ico">◈</span>Costing & wastage
          </button>
          <button className={currentPage === 'reports' ? 'active' : ''} onClick={() => { setCurrentPage('reports'); setSidebarOpen(false); }}>
            <span className="ico">▥</span>Reports & exports
          </button>
          <button className={currentPage === 'alerts' ? 'active' : ''} onClick={() => { setCurrentPage('alerts'); setSidebarOpen(false); }}>
            <span className="ico">♧</span>Alerts & activity
            <span className="count">{alerts.filter((a) => !a.read).length}</span>
          </button>
        </nav>

        <div className="navlabel">ADMINISTRATION</div>
        <nav className="nav">
          <button className={currentPage === 'settings' ? 'active' : ''} onClick={() => { setCurrentPage('settings'); setSidebarOpen(false); }}>
            <span className="ico">⚙</span>Settings
          </button>
        </nav>

        <div className="sidebottom">
          <div className="connection">
            <span className="dot"></span> Local network connected
          </div>
          <p>Production Suite · v2.0</p>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
            <button className="iconbtn mobilemenu" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div className="crumb">
              DRP Portal <span style={{ padding: '0 8px', color: '#c2c9d7' }}>/</span>
              <b>
                {currentPage === 'dashboard' && 'Overview'}
                {currentPage === 'jobs' && 'Production jobs'}
                {currentPage === 'machines' && 'Machine monitor'}
                {currentPage === 'events' && 'Print event monitor'}
                {currentPage === 'workflow' && 'RIP → Print workflow'}
                {currentPage === 'printexp' && 'PrintExp jobs & history'}
                {currentPage === 'artwork' && 'Artwork library'}
                {currentPage === 'inventory' && 'Ink & material stock'}
                {currentPage === 'costing' && 'Costing & wastage'}
                {currentPage === 'reports' && 'Reports & exports'}
                {currentPage === 'alerts' && 'Alerts & activity'}
                {currentPage === 'settings' && 'Settings'}
              </b>
            </div>
          </div>
          <div className="topright">
            <button className="iconbtn" onClick={() => { setCurrentPage('jobs'); }} title="Search jobs">
              ⌕
            </button>
            <button className="iconbtn" onClick={() => setCurrentPage('alerts')} title="View alerts">
              ♧{alerts.some((a) => !a.read) && <span className="notifdot"></span>}
            </button>
            <div className="profile">
              <div className="avatar">AS</div>
              <div className="profiletext">
                <strong>Amar Singh</strong>
                <small>Administrator ▾</small>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content">
          {/* 1. OVERVIEW DASHBOARD */}
          {currentPage === 'dashboard' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Thursday, October 29, 2026 · Live operations</div>
                  <h1>Good morning, Amar <span style={{ fontSize: '24px' }}>✦</span></h1>
                  <p>Here's what's happening across your print floor today.</p>
                </div>
                <div className="actions">
                  <button className="btn" onClick={exportJobsCsv}>↧ Export report</button>
                  <button className="btn primary" onClick={() => openJobModal()}>＋ Create new job</button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid stats">
                <div className="card stat">
                  <div className="stat-top">Active production jobs <span className="stat-icon ib">▤</span></div>
                  <div className="stat-num">{jobs.filter((j) => j.status === 'Printing' || j.status === 'Pending').length + 4}</div>
                  <div className="stat-foot"><span className="up">↑ 3</span> compared with yesterday</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Pieces produced today <span className="stat-icon ig">▣</span></div>
                  <div className="stat-num">{fmt(jobs.filter((j) => j.date === '2026-10-29').reduce((s, j) => s + j.produced, 0))}</div>
                  <div className="stat-foot"><span className="up">↑ 12.8%</span> vs. previous shift</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Material wastage <span className="stat-icon ia">⌁</span></div>
                  <div className="stat-num">2.4<span style={{ fontSize: '16px' }}>%</span></div>
                  <div className="stat-foot"><span className="up">↓ 0.6%</span> under target of 3%</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Overrun alerts <span className="stat-icon ir">⚠</span></div>
                  <div className="stat-num">{jobs.filter((j) => j.status === 'Overrun').length}</div>
                  <div className="stat-foot"><span className="down">Needs attention</span> · Review active alerts</div>
                </div>
              </div>

              {/* Performance Chart & Machine Mini */}
              <div className="grid two">
                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Production performance</h3>
                      <p>Pieces printed across all machines</p>
                    </div>
                    <select
                      className="field"
                      value={chartRange}
                      onChange={(e) => {
                        setChartRange(e.target.value);
                        toast(e.target.value === '30' ? 'Showing 30-day demo trend.' : 'Showing 7-day demo trend.');
                      }}
                      style={{ minWidth: '115px', padding: '8px' }}
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                    </select>
                  </div>
                  <div className="cardbody">
                    <div className="legend">
                      <span><i></i> Produced</span>
                      <span><i></i> Required target</span>
                    </div>
                    <div className="chart">
                      <div className="chartlabels">
                        <span>40k</span><span>30k</span><span>20k</span><span>10k</span><span>0</span>
                      </div>
                      <svg viewBox="0 0 600 170" preserveAspectRatio="none" aria-label="Production chart">
                        <defs>
                          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#536dfe" stopOpacity=".18" />
                            <stop offset="1" stopColor="#536dfe" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <g stroke="#edf0f6" strokeWidth="1">
                          <path d="M0 5H600M0 45H600M0 85H600M0 125H600M0 165H600" />
                        </g>
                        <path
                          d={chartRange === '30' ? 'M0 110 L100 88 L200 95 L300 50 L400 68 L500 31 L600 22 L600 165 L0 165Z' : 'M0 88 L100 70 L200 80 L300 48 L400 57 L500 27 L600 40 L600 165 L0 165Z'}
                          fill="url(#area)"
                        />
                        <path
                          d="M0 77 L100 65 L200 57 L300 48 L400 40 L500 35 L600 25"
                          fill="none"
                          stroke="#21c6b2"
                          strokeWidth="2"
                          strokeDasharray="5 5"
                        />
                        <path
                          d={chartRange === '30' ? 'M0 110 L100 88 L200 95 L300 50 L400 68 L500 31 L600 22' : 'M0 88 L100 70 L200 80 L300 48 L400 57 L500 27 L600 40'}
                          fill="none"
                          stroke="#536dfe"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <g fill="#536dfe">
                          <circle cx="0" cy="88" r="4" />
                          <circle cx="100" cy="70" r="4" />
                          <circle cx="200" cy="80" r="4" />
                          <circle cx="300" cy="48" r="4" />
                          <circle cx="400" cy="57" r="4" />
                          <circle cx="500" cy="27" r="4" />
                          <circle cx="600" cy="40" r="4" />
                        </g>
                      </svg>
                      <div className="xlabels">
                        <span>Oct 23</span><span>Oct 24</span><span>Oct 25</span><span>Oct 26</span><span>Oct 27</span><span>Oct 28</span><span>Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Machine status</h3>
                      <p>7 connected presses · refreshes live</p>
                    </div>
                    <button className="linkbtn" onClick={() => setCurrentPage('machines')}>View all →</button>
                  </div>
                  <div className="cardbody">
                    <div className="machine-list">
                      {machines.slice(0, 4).map((m) => (
                        <div key={m.id} className="machine-row">
                          <div className="machine-ico">▣</div>
                          <div>
                            <strong>{m.name}</strong>
                            <small>{m.status === 'error' ? 'No heartbeat' : `${m.job} · ${fmt(m.output)} pcs`}</small>
                            <div className="mini-progress">
                              <span style={{ width: `${m.util}%`, background: m.status === 'error' ? '#e45c6b' : undefined }}></span>
                            </div>
                          </div>
                          <span className={`status ${m.status === 'live' ? 'live' : m.status === 'idle' ? 'idle' : 'error'}`}>
                            {m.status === 'live' ? '● Online' : m.status === 'idle' ? 'Idle' : 'Offline'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Queue & Alerts */}
              <div className="grid two">
                <div className="card tablecard">
                  <div className="cardhead">
                    <div>
                      <h3>Live production queue</h3>
                      <p>Track quantity and job completion in real time</p>
                    </div>
                    <button className="linkbtn" onClick={() => setCurrentPage('jobs')}>All jobs →</button>
                  </div>
                  <div className="tablewrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Artwork / job</th>
                          <th>Machine</th>
                          <th>Progress</th>
                          <th>Balance</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.filter((j) => j.status !== 'Completed').slice(0, 5).map((j) => {
                          const pct = Math.min(100, Math.round((j.produced / Math.max(j.required, 1)) * 100));
                          const bal = balance(j);
                          return (
                            <tr key={j.id} className={j.priority === 'Urgent' ? 'urgent-row' : ''}>
                              <td>
                                <div className="jobname">
                                  <div className="filethumb">
                                    <img src={j.artworkImage || DEFAULT_ART_IMAGE} alt="Art" style={{ width: '37px', height: '37px', objectFit: 'cover', borderRadius: '9px' }} />
                                  </div>
                                  <div>
                                    <strong>{j.art}</strong>
                                    <small>
                                      {j.id}
                                      {j.priority === 'Urgent' && <span style={{ color: '#e45c6b' }}> · ⚑ Urgent</span>}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{machineName(j.machine)}</td>
                              <td className="barcell">
                                <div className="bartext">
                                  <span>{fmt(j.produced)} / {fmt(j.required)}</span>
                                  <b>{pct}%</b>
                                </div>
                                <div className="bar"><span style={{ width: `${pct}%` }}></span></div>
                              </td>
                              <td className="balance" style={{ color: bal < 0 ? '#e45c6b' : 'inherit' }}>
                                {bal < 0 ? `+${fmt(-bal)}` : fmt(bal)}
                              </td>
                              <td>{statusPill(j.status)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Needs your attention</h3>
                      <p>Recent alerts and production exceptions</p>
                    </div>
                    <button className="linkbtn" onClick={() => setCurrentPage('alerts')}>See all →</button>
                  </div>
                  <div className="cardbody">
                    <div className="alertlist">
                      {alerts.filter((a) => !a.read).slice(0, 3).map((a) => (
                        <div key={a.id} className={`alertitem ${a.type === 'red' ? 'red' : ''}`}>
                          <div className="alerticon">{a.type === 'red' ? '!' : '⚠'}</div>
                          <div>
                            <strong>{a.title}</strong>
                            <p>{a.desc}</p>
                            <time>{a.time}</time>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card" style={{ padding: '18px 20px', marginBottom: '18px' }}>
                <div className="cardhead" style={{ padding: '0 0 15px' }}>
                  <div>
                    <h3>Quick actions</h3>
                    <p>Jump straight into your daily workflow</p>
                  </div>
                </div>
                <div className="grid quickgrid">
                  <button className="quick" onClick={() => openJobModal()}>
                    <span className="stat-icon ib">＋</span>
                    <span>
                      <strong>Create a production job</strong>
                      <small>Upload artwork and set target quantity</small>
                    </span>
                  </button>
                  <button className="quick" onClick={() => setCurrentPage('inventory')}>
                    <span className="stat-icon ig">◫</span>
                    <span>
                      <strong>Update stock levels</strong>
                      <small>Record ink or roll purchases</small>
                    </span>
                  </button>
                  <button className="quick" onClick={() => setCurrentPage('reports')}>
                    <span className="stat-icon ia">↧</span>
                    <span>
                      <strong>Export shift summary</strong>
                      <small>Download CSV report for today</small>
                    </span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 2. PRODUCTION JOBS MODULE */}
          {currentPage === 'jobs' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Production management</div>
                  <h1>Production jobs</h1>
                  <p>Every artwork, target quantity and print status in one place.</p>
                </div>
                <div className="actions">
                  <button className="btn" onClick={exportJobsCsv}>↧ Export CSV</button>
                  <button className="btn primary" onClick={() => openJobModal()}>＋ Create job</button>
                </div>
              </div>

              <div className="card tablecard">
                <div className="cardhead">
                  <div className="filters">
                    <input
                      className="field search"
                      placeholder="⌕ Search job, artwork, customer…"
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                    />
                    <select className="field" value={jobMachine} onChange={(e) => setJobMachine(e.target.value)}>
                      <option value="">All machines</option>
                      {machines.map((m) => (
                        <option key={m.id} value={m.id}>{m.id} · {m.name}</option>
                      ))}
                    </select>
                    <select className="field" value={jobStatus} onChange={(e) => setJobStatus(e.target.value)}>
                      <option value="">All statuses</option>
                      <option>Printing</option>
                      <option>Pending</option>
                      <option>Completed</option>
                      <option>Overrun</option>
                    </select>
                  </div>
                </div>

                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Artwork / job</th>
                        <th>Customer / dealer</th>
                        <th>Machine</th>
                        <th>Required</th>
                        <th>Produced</th>
                        <th>Progress</th>
                        <th>Balance</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.length > 0 ? (
                        filteredJobs.map((j) => {
                          const pct = Math.min(100, Math.round((j.produced / Math.max(j.required, 1)) * 100));
                          const bal = balance(j);
                          return (
                            <tr key={j.id} className={j.priority === 'Urgent' ? 'urgent-row' : ''}>
                              <td>
                                <div className="jobname">
                                  <div className="filethumb">
                                    <img src={j.artworkImage || DEFAULT_ART_IMAGE} alt="Art" style={{ width: '37px', height: '37px', objectFit: 'cover', borderRadius: '9px' }} />
                                  </div>
                                  <div>
                                    <strong>{j.art}</strong>
                                    <small>
                                      {j.id}
                                      {j.priority === 'Urgent' && <span style={{ color: '#e45c6b' }}> · ⚑ Urgent</span>}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {j.customer}
                                <small style={{ display: 'block', color: j.priority === 'Urgent' ? '#fff' : '#9aa4b7', marginTop: '3px' }}>
                                  {j.dealer}
                                </small>
                              </td>
                              <td>{machineName(j.machine)}</td>
                              <td className="qty">{fmt(j.required)}</td>
                              <td className="qty">{fmt(j.produced)}</td>
                              <td className="barcell">
                                <div className="bartext">
                                  <span>{pct}%</span>
                                  <b>{pct >= 100 ? 'Target met' : ''}</b>
                                </div>
                                <div className="bar"><span style={{ width: `${pct}%` }}></span></div>
                              </td>
                              <td className="balance" style={{ color: bal < 0 ? '#e45c6b' : 'inherit' }}>
                                {bal < 0 ? `+${fmt(-bal)} over` : fmt(bal)}
                              </td>
                              <td>{statusPill(j.status)}</td>
                              <td>
                                <button className="rowactions" onClick={() => setSelectedJobDetail(j)} title="View job">
                                  ⋯
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="empty">No jobs match your filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="cardhead">
                  <small className="muted">Showing {filteredJobs.length} of {jobs.length} jobs</small>
                  <button className="btn" onClick={() => toast('Pagination controls active for full dataset integration.')}>
                    Page 1 of 1　›
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 3. MACHINE MONITOR MODULE */}
          {/* CLIENT FEEDBACK: "Remove the entire individual connected-equipment cards section from the Machine Monitor page, including the individual machine cards, their utilization bars and repeated connection information. Retain useful machine monitoring functionality such as: Overall machine status, Online/offline status, Last heartbeat, Total production, Connection exceptions, Machine events. Do not reintroduce the removed individual machine cards." */}
          {currentPage === 'machines' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Connected equipment telemetry</div>
                  <h1>Machine monitor</h1>
                  <p>Seven presses · real-time counter telemetry, software mappings and connection status.</p>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => toast('Machine discovery initiated. Polling LAN connector agents...')}>
                    ⟳ Discover machines
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => {
                      setJobs((prev) =>
                        prev.map((j) => (j.status === 'Printing' ? { ...j, produced: j.produced + 50 } : j))
                      );
                      setMachines((prev) =>
                        prev.map((m) => (m.status === 'live' ? { ...m, output: m.output + 50 } : m))
                      );
                      setActivity((prev) => [{ title: 'Batch counter refresh simulated', desc: 'Active presses updated by 50 pcs each.', time: 'Just now' }, ...prev]);
                      toast('Demo update complete: active jobs updated by 50 pcs each.');
                    }}
                  >
                    ▶ Simulate print update
                  </button>
                </div>
              </div>

              {/* Useful Telemetry Stats */}
              <div className="grid stats">
                <div className="card stat">
                  <div className="stat-top">Machines online <span className="stat-icon ig">▣</span></div>
                  <div className="stat-num">{machines.filter((m) => m.status === 'live').length} <span style={{ fontSize: '14px', color: '#8b96aa' }}>/ 7</span></div>
                  <div className="stat-foot">Last heartbeat within 10 sec</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Total output today <span className="stat-icon ib">▤</span></div>
                  <div className="stat-num">{fmt(machines.reduce((s, m) => s + m.output, 0))}</div>
                  <div className="stat-foot">Across all active presses</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Awaiting job <span className="stat-icon ia">◷</span></div>
                  <div className="stat-num">{machines.filter((m) => m.status === 'idle').length}</div>
                  <div className="stat-foot">Ready to start</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Connection exceptions <span className="stat-icon ir">⚠</span></div>
                  <div className="stat-num">{machines.filter((m) => m.status === 'error').length}</div>
                  <div className="stat-foot">Review offline machine</div>
                </div>
              </div>

              {/* Clean Machine Telemetry Table (No repeated bulky cards!) */}
              <div className="card tablecard" style={{ marginBottom: '18px' }}>
                <div className="cardhead">
                  <div>
                    <h3>Press Telemetry & Software Mappings</h3>
                    <p>Live status, installed RIP & printing software, and production counters</p>
                  </div>
                  <span className="pill green">Live Telemetry Feed</span>
                </div>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Machine ID</th>
                        <th>Press Name</th>
                        <th>RIP & Printing Software</th>
                        <th>Vendor</th>
                        <th>Status</th>
                        <th>Active Job</th>
                        <th>Output Today</th>
                        <th>Utilization</th>
                        <th>Last Heartbeat</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machines.map((m) => (
                        <tr key={m.id}>
                          <td><strong>{m.id}</strong></td>
                          <td>
                            <strong>{m.name}</strong>
                            {m.pilot && <span className="pill green" style={{ marginLeft: '6px' }}>Pilot Candidate</span>}
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', color: '#42506c' }}>{m.software}</span>
                            <small style={{ display: 'block', color: '#97a1b4', marginTop: '2px' }}>{m.model}</small>
                          </td>
                          <td>{m.vendor}</td>
                          <td>
                            <span className={`status ${m.status === 'live' ? 'live' : m.status === 'idle' ? 'idle' : 'error'}`}>
                              {m.status === 'live' ? '● Online' : m.status === 'idle' ? 'Idle' : 'Offline'}
                            </span>
                          </td>
                          <td><b style={{ color: '#4e5b75' }}>{m.job}</b></td>
                          <td className="qty">{fmt(m.output)}</td>
                          <td>
                            <div className="barcell" style={{ minWidth: '90px' }}>
                              <div className="bartext"><span>{m.util}%</span></div>
                              <div className="bar"><span style={{ width: `${m.util}%` }}></span></div>
                            </div>
                          </td>
                          <td><small className="muted">{m.last}</small></td>
                          <td>
                            <button
                              className="btn soft"
                              onClick={() => {
                                const matchingJob = jobs.find((j) => j.machine === m.id && j.status !== 'Completed');
                                if (matchingJob) {
                                  simulateJobCounter(matchingJob.id);
                                } else {
                                  toast('No active job currently assigned to this machine.');
                                }
                              }}
                            >
                              ＋ Counter
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 4. PRINT EVENT MONITOR */}
          {currentPage === 'events' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Integration validation · live event stream</div>
                  <h1>Print event monitor</h1>
                  <p>Match artwork, print-software events and quantities before trusting production totals.</p>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => { setPrintEvents([]); toast('Demo event list cleared.'); }}>
                    Clear demo events
                  </button>
                  <button className="btn primary" onClick={simulatePrintEvent}>
                    ＋ Simulate detected event
                  </button>
                </div>
              </div>

              <div className="alertitem" style={{ marginBottom: '18px', background: '#f1f5ff', borderColor: '#dce5ff' }}>
                <div className="alerticon" style={{ background: '#dfe7ff', color: '#536dfe' }}>i</div>
                <div>
                  <strong>Demo mode — no physical printer or RIP software is connected</strong>
                  <p>Real integration requires confirming access to each installed software version's job history, logs, export or supported API. Print commands are not proof of physical output.</p>
                </div>
              </div>

              {/* Event Stats */}
              <div className="grid stats">
                <div className="card stat">
                  <div className="stat-top">Events captured (demo) <span className="stat-icon ib">⇄</span></div>
                  <div className="stat-num">{printEvents.length}</div>
                  <div className="stat-foot">Sample event log</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Artwork matched <span className="stat-icon ig">✓</span></div>
                  <div className="stat-num">{printEvents.filter((e) => e.state === 'Matched').length}</div>
                  <div className="stat-foot">Linked to a job</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Needs verification <span className="stat-icon ia">◷</span></div>
                  <div className="stat-num">{printEvents.filter((e) => /unverified|needs counter/i.test(e.verification)).length}</div>
                  <div className="stat-foot">Physical output not verified</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Duplicate events blocked <span className="stat-icon ir">⛨</span></div>
                  <div className="stat-num">{printEvents.filter((e) => e.state === 'Duplicate blocked').length}</div>
                  <div className="stat-foot">Demo idempotency check</div>
                </div>
              </div>

              {/* Event Table */}
              <div className="card tablecard">
                <div className="cardhead">
                  <div>
                    <h3>Detected print events</h3>
                    <p>Example of the audit trail the connector provides</p>
                  </div>
                  <div className="filters">
                    <select className="field" value={eventMachineFilter} onChange={(e) => setEventMachineFilter(e.target.value)}>
                      <option value="">All machines</option>
                      {machines.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <select className="field" value={eventStatusFilter} onChange={(e) => setEventStatusFilter(e.target.value)}>
                      <option value="">All event states</option>
                      <option value="Matched">Matched</option>
                      <option value="Unmatched">Unmatched</option>
                      <option value="Duplicate blocked">Duplicate blocked</option>
                    </select>
                  </div>
                </div>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Machine / software</th>
                        <th>Filename</th>
                        <th>Job match</th>
                        <th>Event type</th>
                        <th>Quantity signal</th>
                        <th>Verification</th>
                        <th>State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((e, idx) => {
                        const m = machines.find((x) => x.id === e.machine);
                        const cls = e.state === 'Matched' ? '' : e.state === 'Duplicate blocked' ? 'warn' : 'red';
                        return (
                          <tr key={idx}>
                            <td>{e.time}</td>
                            <td>
                              <b>{m?.name || e.machine}</b>
                              <br />
                              <small className="muted">{m?.software || 'Software unknown'}</small>
                            </td>
                            <td>{e.file}</td>
                            <td>{e.job || '—'}</td>
                            <td>{e.type}</td>
                            <td>{e.qty}</td>
                            <td>{e.verification}</td>
                            <td><span className={`eventstate ${cls}`}>{e.state}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pilot Checklist */}
              <div className="grid two" style={{ marginTop: '18px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ marginTop: 0 }}>Pilot validation checklist</h3>
                  <label style={{ display: 'flex', gap: '10px', margin: '12px 0' }}>
                    <input type="checkbox" defaultChecked /> Read-only access to job history confirmed
                  </label>
                  <label style={{ display: 'flex', gap: '10px', margin: '12px 0' }}>
                    <input type="checkbox" defaultChecked /> Filename reliably matched to a portal job
                  </label>
                  <label style={{ display: 'flex', gap: '10px', margin: '12px 0' }}>
                    <input type="checkbox" defaultChecked /> Copy / X-Y layout quantity interpreted correctly
                  </label>
                  <label style={{ display: 'flex', gap: '10px', margin: '12px 0' }}>
                    <input type="checkbox" defaultChecked /> Duplicate events prevented
                  </label>
                  <label style={{ display: 'flex', gap: '10px', margin: '12px 0' }}>
                    <input type="checkbox" /> Physical output reconciled with counter
                  </label>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ marginTop: 0 }}>Selected pilot candidate</h3>
                  <div className="pill green">Non-HP candidate</div>
                  <h2 style={{ margin: '12px 0 4px' }}>Colorjet SoniQ Solvent</h2>
                  <p className="muted" style={{ fontSize: '12px' }}>SAi PhotoPRINT / Production Manager</p>
                  <div className="divider"></div>
                  <p style={{ fontSize: '12px' }}>
                    Why assess first: documented job queues and job information provide a concrete starting point. Exact installed version, third-party access and counter reliability remain to be verified.
                  </p>
                  <button className="btn primary" onClick={() => setCurrentPage('machines')}>View all machines →</button>
                </div>
              </div>
            </section>
          )}

          {/* 5. RIP TO PRINT WORKFLOW */}
          {currentPage === 'workflow' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">New · workflow mapped from client walkthrough</div>
                  <h1>RIP → Print workflow monitor</h1>
                  <p>Follow one artwork from the network folder through MainTop, PRN generation, PrintExp and output verification.</p>
                </div>
                <div className="actions">
                  <button className="btn" onClick={resetWorkflow}>↺ Reset demo</button>
                  <button className="btn primary" onClick={advanceWorkflow}>▶ Run next step</button>
                </div>
              </div>

              <div className="notice" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px 16px', background: '#fff7e6', border: '1px solid #f6dfaa', borderRadius: '13px', marginBottom: '18px', color: '#775517' }}>
                <div style={{ fontSize: '20px' }}>ⓘ</div>
                <div>
                  <strong>Simulation mode</strong>
                  <div style={{ fontSize: '12px', marginTop: '3px' }}>
                    The workflow below is interactive demo data. It does not read \MACHINEROOM, the G: drive, MainTop or PrintExp. Real detection depends on validating the installed software's logs/API/export and machine counter.
                  </div>
                </div>
              </div>

              {/* Job Stats in Workflow */}
              {(() => {
                const j = jobs.find((x) => x.id === wfJobId) || jobs[0];
                return (
                  <div className="grid stats" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))', marginBottom: '18px' }}>
                    <div className="card stat">
                      <div className="stat-top">Selected job <span className="stat-icon ib">▧</span></div>
                      <div className="stat-num">{j.id}</div>
                      <div className="stat-foot">{j.art}</div>
                    </div>
                    <div className="card stat">
                      <div className="stat-top">Required quantity <span className="stat-icon ib">◎</span></div>
                      <div className="stat-num">{fmt(j.required)}</div>
                      <div className="stat-foot">Definitive portal target</div>
                    </div>
                    <div className="card stat">
                      <div className="stat-top">Recorded output <span className="stat-icon ig">▥</span></div>
                      <div className="stat-num">{fmt(j.produced)}</div>
                      <div className="stat-foot">Demo quantity only</div>
                    </div>
                    <div className="card stat">
                      <div className="stat-top">Balance <span className="stat-icon ia">↗</span></div>
                      <div className="stat-num">{fmt(Math.max(0, j.required - j.produced))}</div>
                      <div className="stat-foot">{j.produced > j.required ? 'Overrun detected' : 'Within target'}</div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid two" style={{ gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, .8fr)', marginBottom: '18px' }}>
                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Workflow stages</h3>
                      <p>Step through the actual process explained in the video</p>
                    </div>
                    <span className="pill blue">{wfStep} / {wfSteps.length} complete</span>
                  </div>
                  <div className="cardbody">
                    <div className="workflow-stages">
                      {wfSteps.map((st, i) => {
                        const state = i < wfStep ? 'done' : i === wfStep ? 'current' : '';
                        const label = i < wfStep ? 'Complete' : i === wfStep ? 'Next step' : 'Waiting';
                        return (
                          <div key={i} className={`wf-stage ${state}`}>
                            <div className="wf-stepno">{i < wfStep ? '✓' : i + 1}</div>
                            <div>
                              <strong>{st.title}</strong>
                              <small>{st.detail}</small>
                            </div>
                            <span className={`status ${i < wfStep ? 'live' : i === wfStep ? 'warn' : 'idle'}`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Job & machine context</h3>
                      <p>Change the sample job or machine for the demo</p>
                    </div>
                  </div>
                  <div className="cardbody">
                    <label className="formlabel">Production job</label>
                    <select className="field" style={{ width: '100%', marginBottom: '13px' }} value={wfJobId} onChange={(e) => setWfJobId(e.target.value)}>
                      {jobs.map((x) => (
                        <option key={x.id} value={x.id}>{x.id} · {x.art}</option>
                      ))}
                    </select>

                    <label className="formlabel">Machine / software</label>
                    <select className="field" style={{ width: '100%', marginBottom: '13px' }} value={wfMachineId} onChange={(e) => setWfMachineId(e.target.value)}>
                      {machines.map((x) => (
                        <option key={x.id} value={x.id}>{x.name} — {x.software}</option>
                      ))}
                    </select>

                    <div className="detailbox" style={{ marginBottom: '10px' }}>
                      <small>Network artwork folder</small>
                      <strong style={{ fontSize: '12px', wordBreak: 'break-all' }}>\\\\MACHINEROOM\\2026\\October\\29\\</strong>
                    </div>
                    <div className="detailbox" style={{ marginBottom: '10px' }}>
                      <small>Local staging folder</small>
                      <strong style={{ fontSize: '12px', wordBreak: 'break-all' }}>G:\\2026\\October\\29\\</strong>
                    </div>
                    <div className="detailbox">
                      <small>Integration status</small>
                      <strong style={{ fontSize: '12px', color: '#b47b0e' }}>Not connected · feasibility check required</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline & Count Confidence */}
              <div className="grid two" style={{ marginBottom: '18px' }}>
                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Print event timeline</h3>
                      <p>Events captured in this session</p>
                    </div>
                    <button className="linkbtn" onClick={() => setWfLogs([])}>Clear timeline</button>
                  </div>
                  <div className="cardbody">
                    <div className="workflow-timeline">
                      {wfLogs.map((l, idx) => (
                        <div key={idx} className="wf-log">
                          <time>{l.time}</time>
                          <div className="wf-dot"></div>
                          <div>
                            <strong>{l.title}</strong>
                            <p>{l.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Count confidence</h3>
                      <p>Do not treat a print command as proof of physical output</p>
                    </div>
                  </div>
                  <div className="cardbody">
                    <div className="confidence-row">
                      <span>Artwork/job match</span>
                      <b className="status live">Matched · demo</b>
                    </div>
                    <div className="confidence-row">
                      <span>RIP / PRN record</span>
                      <b className={`status ${wfStep >= 3 ? 'live' : 'idle'}`}>{wfStep >= 3 ? 'PRN recorded · demo' : 'Waiting'}</b>
                    </div>
                    <div className="confidence-row">
                      <span>PrintExp command</span>
                      <b className={`status ${wfStep >= 5 ? 'live' : 'idle'}`}>{wfStep >= 5 ? 'Command recorded · demo' : 'Waiting'}</b>
                    </div>
                    <div className="confidence-row">
                      <span>Physical output counter</span>
                      <b className="status warn">Unverified</b>
                    </div>
                    <div className="alertitem" style={{ marginTop: '15px' }}>
                      <div className="alerticon">!</div>
                      <div>
                        <strong>Validation required</strong>
                        <p>Confirm whether completed-job history, copies/layout and actual counter values can be exported or read from the installed software.</p>
                      </div>
                    </div>
                    <button className="btn" style={{ marginTop: '12px' }} onClick={() => setCurrentPage('events')}>
                      Open print event monitor →
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 6. PRINTEXP JOB LIST AND HISTORY */}
          {/* CLIENT FEEDBACK: "Remove manual portal controls for loading selected PRN, entering X/Y copies... Instead, automatically retrieve available information from PrintExp. Calculate planned copies automatically: Planned Copies = X-axis Copies × Y-axis Copies. Display automatically detected information in a read-only monitoring interface." */}
          {currentPage === 'printexp' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Mapped from client’s latest PrintExp walkthrough</div>
                  <h1>PrintExp · Job List & History</h1>
                  <p>Review loaded PRN jobs, X/Y layout copies, progress and finished/cancelled history.</p>
                </div>
                <div className="actions">
                  <span className="pill amber">Read-only monitoring view</span>
                </div>
              </div>

              <div className="notice" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px 16px', background: '#fff7e6', border: '1px solid #f6dfaa', borderRadius: '13px', marginBottom: '18px', color: '#775517' }}>
                <div style={{ fontSize: '20px' }}>ⓘ</div>
                <div>
                  <strong>Simulation mode — not connected to PrintExp</strong>
                  <div style={{ fontSize: '12px', marginTop: '3px' }}>
                    The job list and history below are interactive sample data based on the client's video. They do not read Hosonsoft PrintExp, the printer controller, or physical counters.
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid stats" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))', marginBottom: '18px' }}>
                <div className="card stat">
                  <div className="stat-top">Active print jobs <span className="stat-icon ib">▤</span></div>
                  <div className="stat-num">{pxJobs.filter((j) => ['Loaded', 'Printing'].includes(j.status)).length}</div>
                  <div className="stat-foot">Loaded / queued in demo</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Finished today <span className="stat-icon ig">✓</span></div>
                  <div className="stat-num">{pxJobs.filter((j) => j.status === 'Finished').length}</div>
                  <div className="stat-foot">History status: Print Finish</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Planned copies <span className="stat-icon ia">▦</span></div>
                  <div className="stat-num">{pxCopies(pxSelectedJob)}</div>
                  <div className="stat-foot">From detected X × Y layout</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">History exceptions <span className="stat-icon ir">!</span></div>
                  <div className="stat-num">{pxJobs.filter((j) => j.status === 'Cancelled').length}</div>
                  <div className="stat-foot">Cancelled jobs in demo history</div>
                </div>
              </div>

              <div className="grid two" style={{ gridTemplateColumns: 'minmax(0,1.25fr) minmax(300px,.75fr)', marginBottom: '18px' }}>
                {/* Active Jobs Table */}
                <div className="card tablecard">
                  <div className="cardhead">
                    <div>
                      <h3>Print Job List</h3>
                      <p>Loaded .PRN files and job details from the PrintExp workflow</p>
                    </div>
                    <span className="pill amber">Demo queue</span>
                  </div>
                  <div className="tablewrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Job name / PRN file</th>
                          <th>DPI</th>
                          <th>Size</th>
                          <th>Progress</th>
                          <th>Copies</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pxJobs.filter((j) => ['Loaded', 'Printing'].includes(j.status)).map((j) => (
                          <tr key={j.id} onClick={() => setPxSelectedId(j.id)} style={{ cursor: 'pointer', background: j.id === pxSelectedId ? '#f3f6ff' : undefined }}>
                            <td>
                              <div className="jobname">
                                <div className="filethumb">▤</div>
                                <div>
                                  <strong>{j.name}</strong>
                                  <small>{j.job} · {machineName(j.machine)}</small>
                                </div>
                              </div>
                            </td>
                            <td>{j.dpi} DPI</td>
                            <td>{j.size}</td>
                            <td>
                              <div className="barcell">
                                <div className="bartext">
                                  <span>{j.progress}%</span>
                                  <b>{j.status}</b>
                                </div>
                                <div className="bar"><span style={{ width: `${j.progress}%` }}></span></div>
                              </div>
                            </td>
                            <td><b>{j.x} × {j.y} = {fmt(pxCopies(j))}</b></td>
                            <td><span className={`status ${j.status === 'Printing' ? 'warn' : 'idle'}`}>{j.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Automatically Detected Settings Panel (Read-only!) */}
                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Automatically detected settings</h3>
                      <p>Read-only values received from PrintExp in the live integration</p>
                    </div>
                    <span className="pill green">Auto-read · demo data</span>
                  </div>
                  <div className="cardbody">
                    <div className="detailbox" style={{ marginBottom: '12px' }}>
                      <small>Selected PRN job</small>
                      <strong style={{ fontSize: '13px' }}>{pxSelectedJob.name}</strong>
                    </div>
                    <div className="detailgrid">
                      <div className="detailbox">
                        <small>Resolution / DPI</small>
                        <strong>{pxSelectedJob.dpi}</strong>
                      </div>
                      <div className="detailbox">
                        <small>Print dimensions</small>
                        <strong>{pxSelectedJob.size}</strong>
                      </div>
                      <div className="detailbox">
                        <small>X-axis copies</small>
                        <strong>{pxSelectedJob.x}</strong>
                      </div>
                      <div className="detailbox">
                        <small>Y-axis copies</small>
                        <strong>{pxSelectedJob.y}</strong>
                      </div>
                    </div>
                    <div className="detailbox" style={{ marginTop: '14px', background: '#f3f5ff' }}>
                      <small>Planned copies · automatically calculated X × Y</small>
                      <strong style={{ fontSize: '28px', color: '#536dfe' }}>{fmt(pxCopies(pxSelectedJob))}</strong>
                      <p style={{ fontSize: '10px', color: '#7e8aa5', margin: '4px 0 0' }}>
                        Read from the machine software; no duplicate portal entry.
                      </p>
                    </div>
                    <div className="detailbox" style={{ marginTop: '12px' }}>
                      <small>Physical output verification</small>
                      <strong style={{ fontSize: '12px', color: '#b47b0e' }}>Requires machine counter validation</strong>
                    </div>
                    <p className="muted" style={{ fontSize: '11px', marginTop: '12px' }}>
                      Operators continue using PrintExp. The portal only displays detected settings and job status.
                    </p>
                  </div>
                </div>
              </div>

              {/* Job History List */}
              <div className="card tablecard">
                <div className="cardhead">
                  <div>
                    <h3>Job History List</h3>
                    <p>Completed and cancelled print records</p>
                  </div>
                  <div className="filters">
                    <input
                      className="field search"
                      placeholder="Search job or filename…"
                      value={pxSearch}
                      onChange={(e) => setPxSearch(e.target.value)}
                    />
                    <select className="field" value={pxFilter} onChange={(e) => setPxFilter(e.target.value)}>
                      <option value="">All statuses</option>
                      <option value="Finished">Finished</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Loaded">Loaded</option>
                    </select>
                    <button className="btn" onClick={exportPrintExpCsv}>↓ Export CSV</button>
                  </div>
                </div>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Completed / event time</th>
                        <th>Job name</th>
                        <th>Status</th>
                        <th>DPI</th>
                        <th>Size</th>
                        <th>X × Y</th>
                        <th>Planned copies</th>
                        <th>Record</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrintExpHistory.map((j) => (
                        <tr key={j.id}>
                          <td>{j.actual || j.loaded}</td>
                          <td>
                            <div className="jobname">
                              <div className="filethumb">▤</div>
                              <div>
                                <strong>{j.name}</strong>
                                <small>{j.job} · {machineName(j.machine)}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`status ${j.status === 'Finished' ? 'live' : j.status === 'Cancelled' ? 'error' : 'idle'}`}>
                              {j.status === 'Finished' ? 'Print Finish' : j.status}
                            </span>
                          </td>
                          <td>{j.dpi}</td>
                          <td>{j.size}</td>
                          <td>{j.x} × {j.y}</td>
                          <td><b>{fmt(pxCopies(j))}</b></td>
                          <td>{j.record}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 7. ARTWORK LIBRARY */}
          {currentPage === 'artwork' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Files & job metadata</div>
                  <h1>Artwork library</h1>
                  <p>Artwork records detected from the server and linked to production jobs.</p>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => openJobModal()}>
                    ↑ Upload artwork
                  </button>
                  <button className="btn primary" onClick={() => openJobModal()}>
                    ＋ New job from artwork
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="cardhead">
                  <input
                    className="field search"
                    placeholder="Search artwork or job number…"
                    value={artSearch}
                    onChange={(e) => setArtSearch(e.target.value)}
                  />
                  <span className="pill green">Server sync · Demo</span>
                </div>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Artwork preview</th>
                        <th>File name</th>
                        <th>Customer / dealer</th>
                        <th>Dimensions</th>
                        <th>Format</th>
                        <th>Job status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs
                        .filter((j) => `${j.art} ${j.id} ${j.customer}`.toLowerCase().includes(artSearch.toLowerCase()))
                        .map((j) => (
                          <tr key={j.id}>
                            <td>
                              <div className="filethumb">
                                <img src={j.artworkImage || DEFAULT_ART_IMAGE} alt="Preview" style={{ width: '37px', height: '37px', objectFit: 'cover', borderRadius: '9px' }} />
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: '#293650' }}>{j.art}</strong>
                              <small style={{ display: 'block', color: '#98a2b5', marginTop: '4px' }}>{j.id}</small>
                            </td>
                            <td>
                              {j.customer}
                              <small style={{ display: 'block', color: '#9aa4b7', marginTop: '3px' }}>{j.dealer}</small>
                            </td>
                            <td>{j.dims}</td>
                            <td><span className="pill">{j.format}</span></td>
                            <td>{statusPill(j.status)}</td>
                            <td>
                              <button className="btn" onClick={() => setSelectedJobDetail(j)}>Open job</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 8. INK & MATERIAL STOCK */}
          {/* CLIENT FEEDBACK: "Replace the current card-based inventory layout with a clean tabular inventory layout. Create one primary inventory table with: Material/item name, Category, Available stock, Unit, Unit cost, Reorder level, Stock value, Stock status, Actions. Support ink types and roll materials (3ft, 4ft, 5ft, 6ft, 8ft, 10ft)." */}
          {currentPage === 'inventory' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Materials & consumables</div>
                  <h1>Ink & material stock</h1>
                  <p>Track opening stock, purchases, usage and reorder requirements.</p>
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => openStockModal('roll')}>＋ Add roll stock</button>
                  <button className="btn primary" onClick={() => openStockModal('ink')}>＋ Add ink stock</button>
                </div>
              </div>

              {/* Primary Tabular Inventory Table */}
              <div className="card tablecard">
                <div className="cardhead">
                  <div>
                    <h3>Current stock</h3>
                    <p>Ink and roll inventory · unit rates and reorder levels (Roll widths: 3ft to 10ft)</p>
                  </div>
                  <div className="filters">
                    <input
                      className="field search"
                      placeholder="Search stock item…"
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                    />
                    <select className="field" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                      <option value="">All categories</option>
                      <option value="ink">Ink</option>
                      <option value="roll">Roll material</option>
                    </select>
                  </div>
                </div>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Material / item</th>
                        <th>Category</th>
                        <th>Available stock</th>
                        <th>Unit</th>
                        <th>Unit cost</th>
                        <th>Reorder level</th>
                        <th>Stock value</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStock.map((s, idx) => {
                        const val = s.qty * s.cost;
                        const isLow = s.qty <= s.min;
                        return (
                          <tr key={idx}>
                            <td><strong>{s.name}</strong></td>
                            <td>{s.type === 'ink' ? 'Ink' : 'Roll material'}</td>
                            <td className="qty">{fmt(s.qty)}</td>
                            <td>{s.unit}</td>
                            <td>₹{fmt(s.cost)}</td>
                            <td>{fmt(s.min)} {s.unit}</td>
                            <td className="qty">₹{fmt(val)}</td>
                            <td>
                              <span className={`pill ${isLow ? 'red' : 'green'}`}>
                                {isLow ? 'Low stock' : 'In stock'}
                              </span>
                            </td>
                            <td>
                              <button className="linkbtn" onClick={() => openStockModal(s.type as any, s.name)}>
                                + Add stock
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Movements Ledger */}
              <div className="card tablecard" style={{ marginTop: '18px' }}>
                <div className="cardhead">
                  <div>
                    <h3>Recent stock movements</h3>
                    <p>Purchases, opening stock and adjustments</p>
                  </div>
                </div>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Movement</th>
                        <th>Quantity</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.map((l, idx) => (
                        <tr key={idx}>
                          <td><strong>{l.material}</strong></td>
                          <td>{l.movement}</td>
                          <td className="qty">{l.qty}</td>
                          <td>{l.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 9. COSTING & WASTAGE */}
          {/* CLIENT FEEDBACK: "Create a Cost Configuration section inside Costing & Wastage. Provide options: A. Ink Cost Management, B. Ink Head Management, C. Material Cost Management. Calculate job-wise: Material cost, Ink cost, Ink head usage, Total job cost, Wastage quantity, Wastage amount, Cost per good piece." */}
          {currentPage === 'costing' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Profitability & waste control</div>
                  <h1>Costing & wastage</h1>
                  <p>Estimated material cost, ink consumption and production overruns.</p>
                </div>
                <div className="actions">
                  <button className="btn" onClick={exportCostingCsv}>↧ Export costing</button>
                </div>
              </div>

              <div className="grid stats">
                <div className="card stat">
                  <div className="stat-top">Production cost today <span className="stat-icon ib">₹</span></div>
                  <div className="stat-num">₹18,420</div>
                  <div className="stat-foot">Material + ink estimates</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Ink consumed <span className="stat-icon ig">◉</span></div>
                  <div className="stat-num">8.6 <span style={{ fontSize: '14px' }}>L</span></div>
                  <div className="stat-foot">Across 6 active machines</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Wastage cost <span className="stat-icon ir">⌁</span></div>
                  <div className="stat-num">₹1,240</div>
                  <div className="stat-foot">2.4% of today's output</div>
                </div>
                <div className="card stat">
                  <div className="stat-top">Estimated savings <span className="stat-icon ia">↗</span></div>
                  <div className="stat-num">₹3,860</div>
                  <div className="stat-foot">Versus last week's baseline</div>
                </div>
              </div>

              {/* Cost Configuration Section */}
              <div className="card tablecard" style={{ marginBottom: '18px' }}>
                <div className="cardhead">
                  <div>
                    <h3>Cost configuration</h3>
                    <p>Purchase rates used by job costing and wastage calculations (Preserves historical rates)</p>
                  </div>
                  <div className="actions">
                    <button className="btn" onClick={() => addCostRate('ink')}>＋ Add ink rate</button>
                    <button className="btn" onClick={() => addCostRate('head')}>＋ Add ink head</button>
                    <button className="btn primary" onClick={() => addCostRate('material')}>＋ Add material rate</button>
                  </div>
                </div>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Cost item</th>
                        <th>Category</th>
                        <th>Unit / basis</th>
                        <th>Purchase cost</th>
                        <th>Rate used</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costItems.map((c, i) => (
                        <tr key={i}>
                          <td><strong>{c.name}</strong></td>
                          <td>{c.category}</td>
                          <td>{c.basis}</td>
                          <td>₹{fmt(c.purchase)}</td>
                          <td className="qty">₹{fmt(c.rate)}</td>
                          <td>
                            <button
                              className="linkbtn"
                              onClick={() => {
                                const newRate = Number(prompt(`Update rate for ${c.name} (₹):`, String(c.rate)));
                                if (Number.isFinite(newRate) && newRate >= 0) {
                                  setCostItems((prev) => {
                                    const copy = [...prev];
                                    copy[i] = { ...copy[i], rate: newRate, purchase: newRate };
                                    return copy;
                                  });
                                  toast('Cost rate updated.');
                                }
                              }}
                            >
                              Edit rate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Job-wise Costing Table */}
              <div className="card tablecard">
                <div className="cardhead">
                  <div>
                    <h3>Job-wise costing & wastage calculation</h3>
                    <p>Material, ink, and print head usage cost breakdowns per job</p>
                  </div>
                  <select className="field" value={costFilter} onChange={(e) => setCostFilter(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="all">All jobs</option>
                  </select>
                </div>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Job / artwork</th>
                        <th>Produced pcs</th>
                        <th>Material cost</th>
                        <th>Ink usage</th>
                        <th>Ink cost</th>
                        <th>Wastage pcs</th>
                        <th>Wastage amount</th>
                        <th>Total cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(costFilter === 'all' ? jobs : jobs.filter((j) => j.date === '2026-10-29')).map((j) => {
                        const total = j.materialCost + j.inkCost;
                        const wastageAmount = Math.round(total * (j.waste / Math.max(j.produced, 1)));
                        return (
                          <tr key={j.id}>
                            <td>
                              <div className="jobname">
                                <div className="filethumb">
                                  <img src={j.artworkImage || DEFAULT_ART_IMAGE} alt="Art" style={{ width: '37px', height: '37px', objectFit: 'cover', borderRadius: '9px' }} />
                                </div>
                                <div>
                                  <strong>{j.id}</strong>
                                  <small>{j.art}</small>
                                </div>
                              </div>
                            </td>
                            <td>{fmt(j.produced)}</td>
                            <td>₹{fmt(j.materialCost)}</td>
                            <td>{j.ink.toFixed(1)} L</td>
                            <td>₹{fmt(j.inkCost)}</td>
                            <td style={{ color: j.waste > 100 ? '#e45c6b' : 'inherit' }}>{fmt(j.waste)}</td>
                            <td style={{ color: '#d74f60' }}>₹{fmt(wastageAmount)}</td>
                            <td className="qty">₹{fmt(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 10. REPORTS & EXPORTS */}
          {currentPage === 'reports' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Insights & exports</div>
                  <h1>Reports & exports</h1>
                  <p>Build an end-of-shift report by date, machine, customer or job.</p>
                </div>
              </div>

              {/* Report Builder Controls */}
              <div className="card" style={{ padding: '22px', marginBottom: '18px' }}>
                <h3 style={{ margin: '0 0 16px' }}>Report builder</h3>
                <div className="filters">
                  <div className="formfield">
                    <label>From date</label>
                    <input className="field" type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
                  </div>
                  <div className="formfield">
                    <label>To date</label>
                    <input className="field" type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
                  </div>
                  <div className="formfield">
                    <label>Machine</label>
                    <select className="field" value={reportMachine} onChange={(e) => setReportMachine(e.target.value)}>
                      <option value="">All machines</option>
                      {machines.map((m) => (
                        <option key={m.id} value={m.id}>{m.id} · {m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="formfield">
                    <label>Report type</label>
                    <select className="field" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                      <option value="production">Production summary</option>
                      <option value="costing">Costing & wastage</option>
                      <option value="inventory">Inventory movements</option>
                    </select>
                  </div>
                  <button className="btn primary" style={{ alignSelf: 'end' }} onClick={() => toast('Report generated successfully.')}>
                    Generate report
                  </button>
                </div>
              </div>

              {/* Report Stats */}
              {(() => {
                const filtered = jobs.filter((j) => !reportMachine || j.machine === reportMachine);
                const req = filtered.reduce((s, j) => s + j.required, 0);
                const prod = filtered.reduce((s, j) => s + j.produced, 0);
                return (
                  <>
                    <div className="grid stats">
                      <div className="card stat">
                        <div className="stat-top">Jobs in report <span className="stat-icon ib">▤</span></div>
                        <div className="stat-num">{filtered.length}</div>
                        <div className="stat-foot">Based on selected filters</div>
                      </div>
                      <div className="card stat">
                        <div className="stat-top">Total required <span className="stat-icon ia">◎</span></div>
                        <div className="stat-num">{fmt(req)}</div>
                        <div className="stat-foot">Assigned production quantity</div>
                      </div>
                      <div className="card stat">
                        <div className="stat-top">Total produced <span className="stat-icon ig">▣</span></div>
                        <div className="stat-num">{fmt(prod)}</div>
                        <div className="stat-foot">Captured production quantity</div>
                      </div>
                      <div className="card stat">
                        <div className="stat-top">Remaining <span className="stat-icon ir">◷</span></div>
                        <div className="stat-num">{fmt(req - prod)}</div>
                        <div className="stat-foot">Target minus produced</div>
                      </div>
                    </div>

                    <div className="card tablecard">
                      <div className="cardhead">
                        <div>
                          <h3>Report preview</h3>
                          <p id="reportSubtitle">
                            {reportType === 'production' ? 'Production summary' : reportType === 'costing' ? 'Costing & wastage' : 'Inventory movements'} · {reportFrom} to {reportTo}
                          </p>
                        </div>
                        <div className="actions">
                          <button className="btn" onClick={exportJobsCsv}>CSV</button>
                          <button className="btn primary" onClick={exportJobsCsv}>Excel</button>
                        </div>
                      </div>
                      <div className="tablewrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Job number</th>
                              <th>Artwork</th>
                              <th>Machine</th>
                              <th>Required</th>
                              <th>Produced</th>
                              <th>Balance</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((j) => {
                              const bal = balance(j);
                              return (
                                <tr key={j.id}>
                                  <td>{j.id}</td>
                                  <td>{j.art}</td>
                                  <td>{machineName(j.machine)}</td>
                                  <td>{fmt(j.required)}</td>
                                  <td>{fmt(j.produced)}</td>
                                  <td style={{ color: bal < 0 ? '#e45c6b' : 'inherit' }}>
                                    {bal < 0 ? `+${fmt(-bal)} over` : fmt(bal)}
                                  </td>
                                  <td>{statusPill(j.status)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>
          )}

          {/* 11. ALERTS & ACTIVITY */}
          {currentPage === 'alerts' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Exceptions & audit trail</div>
                  <h1>Alerts & activity</h1>
                  <p>Overruns, machine connection issues and recent production events.</p>
                </div>
                <div className="actions">
                  <button
                    className="btn"
                    onClick={() => {
                      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
                      toast('All alerts marked as reviewed.');
                    }}
                  >
                    ✓ Mark all reviewed
                  </button>
                  <button className="btn primary" onClick={() => toast('Alert delivery settings configured.')}>
                    ⚙ Alert settings
                  </button>
                </div>
              </div>

              <div className="grid two">
                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Active alerts</h3>
                      <p>Items requiring attention</p>
                    </div>
                    <span className="pill red">{alerts.filter((a) => !a.read).length} open</span>
                  </div>
                  <div className="cardbody">
                    <div className="alertlist">
                      {alerts.map((a, i) => (
                        <div key={a.id} className={`alertitem ${a.type === 'red' ? 'red' : ''}`} style={{ opacity: a.read ? 0.65 : 1 }}>
                          <div className="alerticon">{a.type === 'red' ? '!' : '⚠'}</div>
                          <div style={{ flex: 1 }}>
                            <strong>{a.title}</strong>
                            <p>{a.desc}</p>
                            <time>{a.time}</time>
                          </div>
                          <button
                            className="linkbtn"
                            onClick={() => {
                              setAlerts((prev) => {
                                const copy = [...prev];
                                copy[i] = { ...copy[i], read: true };
                                return copy;
                              });
                              toast('Alert marked as reviewed.');
                            }}
                          >
                            {a.read ? 'Reviewed' : 'Review'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="cardhead">
                    <div>
                      <h3>Production activity</h3>
                      <p>Latest recorded system events</p>
                    </div>
                    <span className="pill green">Live audit log</span>
                  </div>
                  <div className="cardbody">
                    {activity.map((act, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '11px', padding: '12px 0', borderBottom: '1px solid #eff1f6' }}>
                        <div className="stat-icon ib" style={{ width: '30px', height: '30px', fontSize: '13px' }}>↗</div>
                        <div>
                          <strong style={{ fontSize: '11px' }}>{act.title}</strong>
                          <p className="muted" style={{ margin: '4px 0', fontSize: '10px' }}>{act.desc}</p>
                          <small className="muted" style={{ fontSize: '9px' }}>{act.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 12. SETTINGS */}
          {currentPage === 'settings' && (
            <section className="page active">
              <div className="pagehead">
                <div>
                  <div className="eyebrow">Portal configuration</div>
                  <h1>Settings</h1>
                  <p>Configure production defaults, alerts and user permissions.</p>
                </div>
                <div className="actions">
                  <button className="btn primary" onClick={() => toast('Settings saved in this prototype session.')}>
                    ✓ Save settings
                  </button>
                </div>
              </div>

              <div className="grid two">
                <div className="card" style={{ padding: '22px' }}>
                  <h3 style={{ marginTop: 0 }}>Production rules</h3>
                  <div className="formfield" style={{ marginBottom: '15px' }}>
                    <label>Default overrun threshold</label>
                    <select className="field">
                      <option value="0">Alert immediately at target</option>
                      <option value="1">1% over target</option>
                      <option value="2">2% over target</option>
                    </select>
                  </div>
                  <div className="formfield" style={{ marginBottom: '15px' }}>
                    <label>Dashboard refresh interval</label>
                    <select className="field" defaultValue="5 seconds">
                      <option>3 seconds</option>
                      <option>5 seconds</option>
                      <option>10 seconds</option>
                      <option>30 seconds</option>
                    </select>
                  </div>
                  <div className="formfield">
                    <label>Shift ends at</label>
                    <input className="field" type="time" defaultValue="18:00" />
                  </div>
                  <div className="divider"></div>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px' }}>
                    <input type="checkbox" defaultChecked /> Enable overrun alerts
                  </label>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', marginTop: '12px' }}>
                    <input type="checkbox" defaultChecked /> Email alerts to administrator
                  </label>
                </div>

                <div className="card" style={{ padding: '22px' }}>
                  <h3 style={{ marginTop: 0 }}>Connectivity & access</h3>
                  <div className="alertitem">
                    <div className="alerticon">⌘</div>
                    <div>
                      <strong>LAN machine connector</strong>
                      <p>Windows Node.js connector active on local network</p>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <div className="formfield">
                    <label>Server host</label>
                    <input className="field" defaultValue="192.168.1.10" />
                  </div>
                  <div className="formfield" style={{ marginTop: '13px' }}>
                    <label>History retention</label>
                    <select className="field">
                      <option>2 days (client current system)</option>
                      <option>7 days</option>
                      <option>30 days</option>
                    </select>
                  </div>
                  <div className="divider"></div>
                  <p className="muted" style={{ fontSize: '11px' }}>
                    Machine list and RIP/print software reflect client-provided Machines.pptx. Exact versions, read-only history/API access and physical counter reconciliation must be validated in the pilot.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="footer">
            <span>© 2026 DRP Print Operations · Client review prototype v2.0</span>
            <span>Database-driven application · Windows connector integration architecture</span>
          </div>
        </div>
      </main>

      {/* CREATE / EDIT JOB MODAL */}
      {isJobModalOpen && (
        <div className="modalback" onClick={(e) => { if (e.target === e.currentTarget) setIsJobModalOpen(false); }}>
          <div className="modal">
            <div className="modalhead">
              <h2>{editingJobId ? 'Edit production job' : 'Create production job'}</h2>
              <button className="close" onClick={() => setIsJobModalOpen(false)}>×</button>
            </div>
            <form onSubmit={saveJob}>
              <div className="modalbody">
                <div className="formgrid">
                  <div className="formfield">
                    <label>Job number *</label>
                    <input value={fJob} onChange={(e) => setFJob(e.target.value)} required disabled={!!editingJobId} />
                  </div>
                  <div className="formfield">
                    <label>Required quantity *</label>
                    <input type="number" min="1" value={fQty} onChange={(e) => setFQty(e.target.value)} required />
                  </div>
                  <div className="formfield">
                    <label>Artwork / file name *</label>
                    <input value={fArtwork} onChange={(e) => setFArtwork(e.target.value)} required placeholder="dealer_banner_final.tif" />
                  </div>

                  {/* MANDATORY ARTWORK IMAGE UPLOAD */}
                  <div className="formfield full">
                    <label>Artwork image * (Mandatory)</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} required={!fArtworkImage} />
                    <div className="artwork-preview">
                      {fArtworkImage ? (
                        <img src={fArtworkImage} alt="Artwork preview" />
                      ) : (
                        <span>Upload an artwork image to preview it here. A job cannot be saved without an image.</span>
                      )}
                    </div>
                  </div>

                  <div className="formfield">
                    <label>Customer *</label>
                    <input value={fCustomer} onChange={(e) => setFCustomer(e.target.value)} required placeholder="Customer name" />
                  </div>
                  <div className="formfield">
                    <label>Dealer</label>
                    <input value={fDealer} onChange={(e) => setFDealer(e.target.value)} placeholder="Dealer / outlet" />
                  </div>
                  <div className="formfield">
                    <label>Machine</label>
                    <select value={fMachine} onChange={(e) => setFMachine(e.target.value)}>
                      {machines.map((m) => (
                        <option key={m.id} value={m.id}>{m.id} · {m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="formfield">
                    <label>Dimensions</label>
                    <input value={fDimensions} onChange={(e) => setFDimensions(e.target.value)} placeholder="e.g. 4 × 8 ft" />
                  </div>
                  <div className="formfield">
                    <label>Priority</label>
                    <select value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
                      <option>Normal</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <div className="formfield full">
                    <label>Notes</label>
                    <input value={fNotes} onChange={(e) => setFNotes(e.target.value)} placeholder="Optional production instructions" />
                  </div>
                </div>
              </div>
              <div className="modalfoot">
                <button type="button" className="btn" onClick={() => setIsJobModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary">Save production job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOB DETAILS MODAL */}
      {selectedJobDetail && (
        <div className="modalback" onClick={(e) => { if (e.target === e.currentTarget) setSelectedJobDetail(null); }}>
          <div className="modal">
            <div className="modalhead">
              <h2>Production job details</h2>
              <button className="close" onClick={() => setSelectedJobDetail(null)}>×</button>
            </div>
            <div className="modalbody">
              <div className="detailtitle">
                <div className="filethumb" style={{ width: '50px', height: '50px' }}>
                  <img src={selectedJobDetail.artworkImage || DEFAULT_ART_IMAGE} alt="Art" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                </div>
                <div>
                  <h3>{selectedJobDetail.art}</h3>
                  <p>{selectedJobDetail.id} · {selectedJobDetail.customer} / {selectedJobDetail.dealer}</p>
                </div>
              </div>

              <div className="detailgrid">
                <div className="detailbox">
                  <small>Required quantity</small>
                  <strong>{fmt(selectedJobDetail.required)}</strong>
                </div>
                <div className="detailbox">
                  <small>Produced quantity</small>
                  <strong>{fmt(selectedJobDetail.produced)}</strong>
                </div>
                <div className="detailbox">
                  <small>{balance(selectedJobDetail) < 0 ? 'Overrun quantity' : 'Remaining quantity'}</small>
                  <strong style={{ color: balance(selectedJobDetail) < 0 ? '#e45c6b' : '#536dfe' }}>
                    {fmt(Math.abs(balance(selectedJobDetail)))}
                  </strong>
                </div>
                <div className="detailbox">
                  <small>Production status</small>
                  <strong style={{ fontSize: '15px', marginTop: '10px' }}>{selectedJobDetail.status}</strong>
                </div>
              </div>

              <div style={{ margin: '17px 0 8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="muted">Completion</span>
                <strong>{Math.round((selectedJobDetail.produced / Math.max(1, selectedJobDetail.required)) * 100)}%</strong>
              </div>
              <div className="bar" style={{ height: '8px' }}>
                <span style={{ width: `${Math.min(100, (selectedJobDetail.produced / selectedJobDetail.required) * 100)}%` }}></span>
              </div>

              <div className="divider"></div>
              <p style={{ fontSize: '12px', margin: '8px 0' }}>
                <b>Machine:</b> {machineName(selectedJobDetail.machine)}　 <b>Dimensions:</b> {selectedJobDetail.dims}
              </p>
              <p style={{ fontSize: '12px', margin: '8px 0' }}>
                <b>Priority:</b> {selectedJobDetail.priority}　 <b>Artwork format:</b> {selectedJobDetail.format}
              </p>
              <p className="muted" style={{ fontSize: '11px' }}>
                Production event history is tracked by the local machine connector with SHA-256 idempotency protection.
              </p>
            </div>
            <div className="modalfoot">
              <button className="btn" onClick={() => setSelectedJobDetail(null)}>Close</button>
              <button
                className="btn"
                onClick={() => {
                  const id = selectedJobDetail.id;
                  setSelectedJobDetail(null);
                  openJobModal(id);
                }}
              >
                ✎ Edit job
              </button>
              <button
                className="btn soft"
                onClick={() => {
                  toggleUrgent(selectedJobDetail.id);
                  setSelectedJobDetail((prev: any) => ({ ...prev, priority: prev.priority === 'Urgent' ? 'Normal' : 'Urgent' }));
                }}
              >
                ⚑ {selectedJobDetail.priority === 'Urgent' ? 'Remove urgent' : 'Mark urgent'}
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  simulateJobCounter(selectedJobDetail.id);
                  setSelectedJobDetail((prev: any) => {
                    const prod = prev.produced + 120;
                    return { ...prev, produced: prod, status: prod > prev.required ? 'Overrun' : prod >= prev.required ? 'Completed' : 'Printing' };
                  });
                }}
              >
                ＋ Add counter (+120)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD STOCK / PURCHASE MODAL */}
      {isStockModalOpen && (
        <div className="modalback" onClick={(e) => { if (e.target === e.currentTarget) setIsStockModalOpen(false); }}>
          <div className="modal">
            <div className="modalhead">
              <h2>{stockModalType === 'roll' ? 'Add Roll Stock (Media)' : 'Add Ink Stock (Consumables)'}</h2>
              <button className="close" onClick={() => setIsStockModalOpen(false)}>×</button>
            </div>
            <form onSubmit={saveStockEntry}>
              <div className="modalbody">
                <div className="formgrid">
                  <div className="formfield">
                    <label>Stock type</label>
                    <select
                      value={stockModalType}
                      onChange={(e) => {
                        const t = e.target.value as 'ink' | 'roll';
                        setStockModalType(t);
                        setStockModalMaterial(t === 'ink' ? 'CMYK Ink' : 'Flex 4 ft');
                        setStockUnit(t === 'ink' ? 'Litres' : 'Rolls');
                      }}
                    >
                      <option value="ink">Ink</option>
                      <option value="roll">Roll / flex</option>
                    </select>
                  </div>
                  <div className="formfield">
                    <label>Material</label>
                    <select value={stockModalMaterial} onChange={(e) => setStockModalMaterial(e.target.value)}>
                      {stock.filter((s) => s.type === stockModalType).map((s) => (
                        <option key={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="formfield">
                    <label>Quantity to add</label>
                    <input type="number" step="0.1" min="0.1" value={stockQty} onChange={(e) => setStockQty(e.target.value)} required />
                  </div>
                  <div className="formfield">
                    <label>Unit</label>
                    <select value={stockUnit} onChange={(e) => setStockUnit(e.target.value)}>
                      <option>Litres</option>
                      <option>Rolls</option>
                      <option>Metres</option>
                    </select>
                  </div>
                  <div className="formfield">
                    <label>Unit cost (₹)</label>
                    <input type="number" min="0" value={stockCost} onChange={(e) => setStockCost(e.target.value)} />
                  </div>
                  <div className="formfield">
                    <label>Movement type</label>
                    <select value={stockMovement} onChange={(e) => setStockMovement(e.target.value)}>
                      <option>Purchase</option>
                      <option>Opening stock</option>
                      <option>Adjustment</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modalfoot">
                <button type="button" className="btn" onClick={() => setIsStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary">Save stock entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {showToast && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
