const { z } = require('zod');
const { ApiError } = require('./errorHandler');

/**
 * Express middleware to validate request body using a Zod schema.
 */
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Collect error messages
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(`Validation failed: ${messages}`, 400, 'VALIDATION_ERROR'));
      }
      next(error);
    }
  };
}

// -----------------------------------------------------------------------------
// Authentication Schemas (Phase 2)
// -----------------------------------------------------------------------------

const sendOtpSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(15, 'Phone number cannot exceed 15 characters').regex(/^\+?[0-9]+$/, 'Invalid phone number format').optional(),
  email: z.string().email('Invalid email format').optional(),
  purpose: z.enum(['registration', 'login']).optional()
}).refine(data => data.phone || data.email, {
  message: 'Must provide either phone or email',
  path: ['phone']
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email('Invalid email format').optional(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^[0-9]+$/, 'OTP must contain only numbers'),
  purpose: z.enum(['registration', 'login']).optional()
}).refine(data => data.phone || data.email, {
  message: 'Must provide either phone or email',
  path: ['phone']
});

const registerSchema = z.union([
  // Donor Registration — supports both phone OTP and email OTP flows
  z.object({
    role: z.literal('donor'),
    phone: z.string().min(10).max(15).optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
    verificationToken: z.string().optional(),
    verification_token: z.string().optional()
  }).refine(data => data.phone || data.email, {
    message: 'Either phone or email is required for donor registration',
    path: ['phone']
  }).refine(data => data.verificationToken || data.verification_token, {
    message: 'verificationToken is required',
    path: ['verificationToken']
  }),
  
  // Hospital Admin Registration
  z.object({
    role: z.literal('admin'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10).max(15),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    hospitalName: z.string().min(2, 'Hospital name must be at least 2 characters'),
    hospitalType: z.enum(['Government', 'Private', 'Trust', 'Semi-Govt']),
    license_no: z.string().min(1, 'License number is required'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.enum(['Mumbai', 'Pune', 'Nagpur', 'Satara', 'Kolhapur']),
    state: z.string().min(2, 'State must be at least 2 characters'),
    pincode: z.string().length(6, 'Pincode must be exactly 6 digits').regex(/^[0-9]+$/, 'Pincode must contain only numbers'),
    lat: z.union([z.number(), z.string().transform(Number)]),
    lng: z.union([z.number(), z.string().transform(Number)]),
    licenseDocument: z.string().optional(),
    license_document: z.string().optional()
  })
]);

const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
  otp: z.string().length(6).optional(),
  verificationToken: z.string().optional(),
  verification_token: z.string().optional()
}).refine(data => {
  if (data.email) {
    return !!data.password;
  }
  if (data.phone) {
    return !!data.otp || !!data.verificationToken || !!data.verification_token;
  }
  return false;
}, {
  message: 'Must provide either email/password or phone/OTP/verification_token',
  path: ['email']
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
  refresh_token: z.string().optional()
}).refine(data => data.refreshToken || data.refresh_token, {
  message: 'refreshToken is required',
  path: ['refreshToken']
});

const setPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
  refresh_token: z.string().optional()
}).refine(data => data.refreshToken || data.refresh_token, {
  message: 'refreshToken is required',
  path: ['refreshToken']
});

// -----------------------------------------------------------------------------
// Donor Portal & Public Schemas (Phase 3)
// -----------------------------------------------------------------------------

const createProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 18 && val <= 65, {
    message: 'Age must be between 18 and 65'
  }),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  weight: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 45, {
    message: 'Weight must be at least 45 kg'
  }),
  chronicIllness: z.boolean(),
  lastDonatedDate: z.string().nullable().optional().or(z.literal(''))
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  age: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 18 && val <= 65).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  weight: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 45).optional(),
  chronicIllness: z.boolean().optional(),
  availableForDonation: z.boolean().optional(),
  lastDonatedDate: z.string().nullable().optional().or(z.literal(''))
});

const saveLocationSchema = z.object({
  lat: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= -90 && val <= 90, {
    message: 'Latitude must be between -90 and 90'
  }),
  lng: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= -180 && val <= 180, {
    message: 'Longitude must be between -180 and 180'
  }),
  city: z.enum(['Mumbai', 'Pune', 'Nagpur', 'Satara', 'Kolhapur']),
  pincode: z.string().length(6, 'Pincode must be exactly 6 digits').regex(/^[0-9]+$/, 'Pincode must contain only numbers')
});

const pledgeSchema = z.object({
  emergencyId: z.union([z.number(), z.string().transform(Number)])
});

const demoRequestSchema = z.object({
  email: z.string().email('Invalid email address')
});

const addBatchSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  units: z.union([z.number(), z.string().transform(Number)]).refine(val => val > 0, {
    message: 'Units must be a positive number'
  }),
  collectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'collectionDate must be in YYYY-MM-DD format'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expiryDate must be in YYYY-MM-DD format'),
  source: z.string().optional(),
  remarks: z.string().optional()
});

const updateBatchSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional(),
  units: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 0, {
    message: 'Units must be non-negative'
  }).optional(),
  reservedUnits: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 0, {
    message: 'Reserved units must be non-negative'
  }).optional(),
  collectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'collectionDate must be in YYYY-MM-DD format').optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expiryDate must be in YYYY-MM-DD format').optional(),
  source: z.string().optional(),
  remarks: z.string().optional()
});

const surgicalScheduleSchema = z.object({
  surgeryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'surgeryDate must be in YYYY-MM-DD format'),
  surgeryType: z.string().min(2, 'Surgery type must be at least 2 characters'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  units: z.union([z.number(), z.string().transform(Number)]).refine(val => val > 0, {
    message: 'Units must be a positive number'
  })
});

const updateEmergencyStatusSchema = z.object({
  status: z.enum(['pending', 'fulfilled', 'cancelled'])
});

const createTransferSchema = z.object({
  fromHospitalId: z.union([z.number(), z.string().transform(Number)]),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  units: z.union([z.number(), z.string().transform(Number)]).refine(val => val > 0, {
    message: 'Units must be a positive number'
  }),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string().optional()
});

const updateTransferStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'completed', 'cancelled'])
});

const updateThresholdsSchema = z.object({
  minStock: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 0, {
    message: 'minStock must be non-negative'
  }),
  maxStock: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 0, {
    message: 'maxStock must be non-negative'
  }),
  criticalUnits: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 0, {
    message: 'criticalUnits must be non-negative'
  }),
  expiryDays: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 0, {
    message: 'expiryDays must be non-negative'
  })
});

const createCampSchema = z.object({
  name: z.string().min(2, 'Camp name must be at least 2 characters'),
  campDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'campDate must be in YYYY-MM-DD format'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  lat: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= -90 && val <= 90),
  lng: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= -180 && val <= 180),
  organizer: z.string().min(2, 'Organizer must be at least 2 characters'),
  capacity: z.union([z.number(), z.string().transform(Number)]).refine(val => val > 0).optional(),
  expectedDonors: z.union([z.number(), z.string().transform(Number)]).refine(val => val > 0).optional()
});

const updateCampStatusSchema = z.object({
  status: z.enum(['upcoming', 'active', 'completed', 'cancelled'])
});

const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['staff', 'admin'])
});

const approveHospitalSchema = z.object({
  status: z.enum(['verified', 'rejected'])
});

const updateUserSchema = z.object({
  role: z.enum(['donor', 'staff', 'admin', 'district', 'state', 'sysadmin']).optional(),
  status: z.enum(['Active', 'Suspended', 'Pending']).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

module.exports = {
  validateRequest,
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
  logoutSchema,
  setPasswordSchema,
  refreshSchema,
  createProfileSchema,
  updateProfileSchema,
  saveLocationSchema,
  pledgeSchema,
  demoRequestSchema,
  addBatchSchema,
  updateBatchSchema,
  surgicalScheduleSchema,
  updateEmergencyStatusSchema,
  createTransferSchema,
  updateTransferStatusSchema,
  updateThresholdsSchema,
  createCampSchema,
  updateCampStatusSchema,
  createStaffSchema,
  approveHospitalSchema,
  updateUserSchema,
  changePasswordSchema
};



