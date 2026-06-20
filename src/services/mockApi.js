// Mock API Service for RaktSetu Hospital Portal
// Persists state in localStorage and simulates network delays

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const TODAY = new Date("2026-06-12");

const getRelativeDateString = (offsetDays) => {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const INITIAL_INVENTORY = [
  {
    id: "bag-1",
    bloodGroup: "O-",
    units: 12,
    reservedUnits: 2,
    collectionDate: getRelativeDateString(-25),
    expiryDate: getRelativeDateString(10), // Expiring in 10 days
    source: "Voluntary Donation",
    remarks: "Rh negative, high demand. Checked twice."
  },
  {
    id: "bag-2",
    bloodGroup: "A+",
    units: 24,
    reservedUnits: 0,
    collectionDate: getRelativeDateString(-15),
    expiryDate: getRelativeDateString(20), // Expiring in 20 days
    source: "Apex Lab Transfer",
    remarks: "Standard stock."
  },
  {
    id: "bag-3",
    bloodGroup: "B+",
    units: 18,
    reservedUnits: 4,
    collectionDate: getRelativeDateString(-5),
    expiryDate: getRelativeDateString(35), // Available, fresh
    source: "Replacement Donation",
    remarks: "Collected during emergency camp."
  },
  {
    id: "bag-4",
    bloodGroup: "AB+",
    units: 3,
    reservedUnits: 0,
    collectionDate: getRelativeDateString(-28),
    expiryDate: getRelativeDateString(2), // Expiring in 2 days (Critical)
    source: "Voluntary Donation",
    remarks: "Low stock level, alert triggered."
  },
  {
    id: "bag-5",
    bloodGroup: "O+",
    units: 35,
    reservedUnits: 5,
    collectionDate: getRelativeDateString(-10),
    expiryDate: getRelativeDateString(30),
    source: "Voluntary Donation",
    remarks: "Bulk supply, cold chain verified."
  },
  {
    id: "bag-6",
    bloodGroup: "A-",
    units: 5,
    reservedUnits: 0,
    collectionDate: getRelativeDateString(-38),
    expiryDate: getRelativeDateString(-3), // Expired 3 days ago
    source: "Replacement Donation",
    remarks: "Pending disposal."
  },
  {
    id: "bag-7",
    bloodGroup: "AB-",
    units: 1,
    reservedUnits: 0,
    collectionDate: getRelativeDateString(-42),
    expiryDate: getRelativeDateString(-7), // Expired 7 days ago
    source: "Apex Lab Transfer",
    remarks: "Needs biological waste logging."
  },
  {
    id: "bag-8",
    bloodGroup: "B-",
    units: 8,
    reservedUnits: 0,
    collectionDate: getRelativeDateString(-12),
    expiryDate: getRelativeDateString(18),
    source: "Voluntary Donation",
    remarks: "Standard storage."
  }
];

const INITIAL_TRANSFERS = [
  {
    id: "tr-1",
    hospitalName: "Red Cross Blood Bank, East",
    bloodGroup: "O-",
    unitsRequired: 6,
    distance: 4.2,
    priority: "Critical",
    status: "Pending",
    message: "Multiple trauma cases in ER. Urgent dispatch required.",
    date: getRelativeDateString(0),
    type: "Incoming"
  },
  {
    id: "tr-2",
    hospitalName: "Max Healthcare, South Delhi",
    bloodGroup: "A+",
    unitsRequired: 10,
    distance: 7.8,
    priority: "High",
    status: "Approved",
    message: "Scheduled bypass surgeries for tomorrow.",
    date: getRelativeDateString(-1),
    type: "Incoming"
  },
  {
    id: "tr-3",
    hospitalName: "St. Stephens Hospital",
    bloodGroup: "B+",
    unitsRequired: 5,
    distance: 12.0,
    priority: "Medium",
    status: "Rejected",
    message: "Routine inventory balancing.",
    date: getRelativeDateString(-2),
    type: "Incoming"
  },
  {
    id: "tr-4",
    hospitalName: "Metro Hospital & Heart Institute",
    bloodGroup: "AB-",
    unitsRequired: 2,
    distance: 5.5,
    priority: "High",
    status: "Pending",
    message: "Requesting replacement bags.",
    date: getRelativeDateString(0),
    type: "Outgoing"
  }
];

const INITIAL_EMERGENCIES = [
  {
    id: "er-1",
    hospitalName: "Holy Family Emergency Center",
    bloodGroup: "O-",
    unitsRequired: 8,
    distance: 1.8,
    status: "Pending",
    // Count down to 25 mins from now
    targetTimestamp: Date.now() + 25 * 60 * 1000,
    message: "Major highway accident. Multiple victims in hemorrhagic shock. Immediate universal donor blood required."
  },
  {
    id: "er-2",
    hospitalName: "Fortis Escorts Heart Institute",
    bloodGroup: "AB-",
    unitsRequired: 4,
    distance: 3.2,
    status: "Pending",
    // Count down to 14 mins from now
    targetTimestamp: Date.now() + 14 * 60 * 1000,
    message: "Complicated aortic dissection surgery. Extracorporeal support active."
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Critical Expiry Warning",
    message: "AB+ Stock (bag-4) is expiring in 2 days! Plan usage or transfer.",
    type: "Expiry",
    read: false,
    timestamp: new Date(TODAY).getTime() - 10 * 60 * 1000 // 10 mins ago
  },
  {
    id: "notif-2",
    title: "NEW Emergency SOS Request",
    message: "Holy Family Emergency Center requests 8 units of O- immediately.",
    type: "Emergency",
    read: false,
    timestamp: new Date(TODAY).getTime() - 2 * 60 * 1000 // 2 mins ago
  },
  {
    id: "notif-3",
    title: "Incoming Transfer Request",
    message: "Red Cross Blood Bank, East requests 6 units of O-.",
    type: "Transfer",
    read: false,
    timestamp: new Date(TODAY).getTime() - 45 * 60 * 1000 // 45 mins ago
  },
  {
    id: "notif-4",
    title: "Stock Alert: Low Units",
    message: "AB+ Available Units are below safe threshold (less than 5 units remaining).",
    type: "Stock Low",
    read: true,
    timestamp: new Date(TODAY).getTime() - 3 * 3600 * 1000 // 3 hours ago
  }
];

const loadDB = (key, initialData) => {
  const data = localStorage.getItem(`raktsetu_db_${key}`);
  if (data) return JSON.parse(data);
  localStorage.setItem(`raktsetu_db_${key}`, JSON.stringify(initialData));
  return initialData;
};

const saveDB = (key, data) => {
  localStorage.setItem(`raktsetu_db_${key}`, JSON.stringify(data));
};

export const mockApi = {
  // Inventory CRUD
  getInventory: async () => {
    await delay();
    const list = loadDB("inventory", INITIAL_INVENTORY);
    // Dynamically calculate status
    return list.map(item => {
      const expDate = new Date(item.expiryDate);
      const diffTime = expDate - TODAY;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status = "Available";
      if (diffDays < 0) {
        status = "Expired";
      } else if (diffDays <= 30) {
        status = "Expiring Soon";
      } else if (item.units - item.reservedUnits <= 3) {
        status = "Low Stock";
      }

      return {
        ...item,
        status,
        daysRemaining: diffDays
      };
    });
  },

  addInventory: async (item) => {
    await delay();
    const list = loadDB("inventory", INITIAL_INVENTORY);
    const newItem = {
      ...item,
      id: "bag-" + Date.now(),
      units: parseInt(item.units, 10),
      reservedUnits: 0
    };
    list.push(newItem);
    saveDB("inventory", list);
    
    // Add success notification
    const notifs = loadDB("notifications", INITIAL_NOTIFICATIONS);
    notifs.unshift({
      id: "notif-" + Date.now(),
      title: "Stock Added Successfully",
      message: `${newItem.units} units of ${newItem.bloodGroup} added to inventory.`,
      type: "Stock Low",
      read: false,
      timestamp: Date.now()
    });
    saveDB("notifications", notifs);

    return newItem;
  },

  updateInventory: async (id, updatedFields) => {
    await delay();
    const list = loadDB("inventory", INITIAL_INVENTORY);
    const index = list.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Item not found");
    
    list[index] = { 
      ...list[index], 
      ...updatedFields,
      units: parseInt(updatedFields.units ?? list[index].units, 10),
      reservedUnits: parseInt(updatedFields.reservedUnits ?? list[index].reservedUnits, 10)
    };
    saveDB("inventory", list);
    return list[index];
  },

  deleteInventory: async (id) => {
    await delay();
    let list = loadDB("inventory", INITIAL_INVENTORY);
    const itemToDelete = list.find(i => i.id === id);
    list = list.filter(i => i.id !== id);
    saveDB("inventory", list);
    
    if (itemToDelete) {
      const notifs = loadDB("notifications", INITIAL_NOTIFICATIONS);
      notifs.unshift({
        id: "notif-" + Date.now(),
        title: "Stock Batch Removed",
        message: `Batch containing ${itemToDelete.bloodGroup} was manually removed.`,
        type: "Stock Low",
        read: false,
        timestamp: Date.now()
      });
      saveDB("notifications", notifs);
    }
    return true;
  },

  // Transfers
  getTransferRequests: async () => {
    await delay();
    return loadDB("transfers", INITIAL_TRANSFERS);
  },

  updateTransferStatus: async (id, status) => {
    await delay();
    const list = loadDB("transfers", INITIAL_TRANSFERS);
    const index = list.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Transfer request not found");
    
    list[index].status = status;
    saveDB("transfers", list);

    // If approved, reserve the blood units
    if (status === "Approved") {
      const req = list[index];
      const inventory = loadDB("inventory", INITIAL_INVENTORY);
      
      // Try to find a matching available batch to deduct/reserve
      const batch = inventory.find(i => i.bloodGroup === req.bloodGroup && (i.units - i.reservedUnits) >= req.unitsRequired);
      if (batch) {
        batch.reservedUnits += req.unitsRequired;
        saveDB("inventory", inventory);
      }
    }
    
    return list[index];
  },

  // Emergencies
  getEmergencyRequests: async () => {
    await delay();
    return loadDB("emergencies", INITIAL_EMERGENCIES);
  },

  updateEmergencyStatus: async (id, status) => {
    await delay();
    const list = loadDB("emergencies", INITIAL_EMERGENCIES);
    const index = list.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Emergency request not found");
    
    list[index].status = status;
    saveDB("emergencies", list);

    // If accepted, reserve and immediately deduct units
    if (status === "Accepted") {
      const req = list[index];
      const inventory = loadDB("inventory", INITIAL_INVENTORY);
      const batch = inventory.find(i => i.bloodGroup === req.bloodGroup && i.units >= req.unitsRequired);
      if (batch) {
        batch.units -= req.unitsRequired; // Deduct blood units immediately for emergency dispatch
        saveDB("inventory", inventory);
      }
    }
    return list[index];
  },

  // Notifications
  getNotifications: async () => {
    await delay(100);
    return loadDB("notifications", INITIAL_NOTIFICATIONS);
  },

  markNotificationRead: async (id) => {
    await delay(50);
    const notifs = loadDB("notifications", INITIAL_NOTIFICATIONS);
    const notif = notifs.find(n => n.id === id);
    if (notif) notif.read = true;
    saveDB("notifications", notifs);
    return notifs;
  },

  markAllNotificationsRead: async () => {
    await delay(100);
    const notifs = loadDB("notifications", INITIAL_NOTIFICATIONS);
    notifs.forEach(n => n.read = true);
    saveDB("notifications", notifs);
    return notifs;
  },

  // Analytics helper
  getAnalytics: async () => {
    await delay();
    return {
      monthlyUsage: [
        { month: "Jan", usage: 140, collections: 155 },
        { month: "Feb", usage: 165, collections: 170 },
        { month: "Mar", usage: 180, collections: 195 },
        { month: "Apr", usage: 195, collections: 210 },
        { month: "May", usage: 220, collections: 230 },
        { month: "Jun", usage: 210, collections: 245 }
      ],
      bloodDemandByGroup: {
        labels: ["O+", "A+", "B+", "O-", "A-", "B-", "AB+", "AB-"],
        demand: [65, 45, 55, 75, 25, 20, 15, 12],
        supply: [60, 48, 50, 40, 18, 15, 16, 5]
      },
      expiryTrend: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        expired: [2, 1, 4, 2],
        wasted: [1, 0, 2, 1]
      },
      transferSuccessTrend: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        successRate: [92, 94, 88, 95, 96, 98]
      }
    };
  }
};
