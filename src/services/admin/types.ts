export type UserRole = "ADMIN" | "CLIENT";
export type ProductMode = "VENTA" | "RENTA" | "MIXTO";
export type RentalStatus =
  "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "DELIVERED" | "RETURNED";

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type ProductImage = {
  id: number;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
};

export type AdminUser = {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  rol: UserRole;
  activo: boolean;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt?: string;
};

export type AdminProduct = {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  medidas: string | null;
  pesoSoportado: string | null;
  material: string | null;
  contenidoCaja: string | null;
  indicacionesUso: string | null;
  precio: number;
  clasificacion: string;
  stock: number;
  proveedor: string;
  tipoAdquisicion: ProductMode;
  requiereReceta: boolean;
  rentalDailyPrice: number | null;
  rentalMinDays: number;
  rentalDeposit: number;
  rentalTerms: string | null;
  activo: boolean;
  imageUrl: string | null;
  images: ProductImage[];
  createdAt?: string;
};

export type BrandOption = {
  id: number;
  nombre: string;
  createdAt?: string;
};

export type ClassificationOption = {
  id: number;
  nombre: string;
  createdAt?: string;
};

export type SupplierOption = {
  id: number;
  nombre: string;
  encargado: string;
  repartidor: string;
  direccion: string;
  createdAt?: string;
};

export type PromotionImageStrategy = "AUTO" | "CUSTOM";

export type AdminPromotion = {
  id: number;
  discountPercent: number;
  descripcion: string;
  startAt: string;
  endAt: string;
  imageStrategy: PromotionImageStrategy;
  imageUrl: string | null;
  displayImageUrl: string | null;
  productCount: number;
  createdAt?: string;
  products: Array<{
    id: number;
    slug?: string;
    nombre: string;
    clasificacion: string;
    precio: number;
    stock: number;
    activo: boolean;
    imageUrl: string | null;
  }>;
};

export type CouponDiscountType = "PERCENT" | "FIXED";

export type AdminCoupon = {
  id: number;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startAt: string;
  endAt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AnalyticsRange = {
  from: string;
  to: string;
  days: number;
};

export type AnalyticsKpis = {
  productsActive: number;
  productsLowStock: number;
  reviewsTotalInRange: number;
  reviewsPending: number;
  reviewsApprovedInRange: number;
  promotionsActive: number;
  newUsersInRange: number;
  sessionActivityEvents: number;
};

export type AnalyticsDailyPoint = {
  date: string;
  count: number;
};

export type AnalyticsDashboardData = {
  range: AnalyticsRange;
  notes: string[];
  kpis: AnalyticsKpis;
  series: {
    registrationsByDay: AnalyticsDailyPoint[];
    reviewsByDay: AnalyticsDailyPoint[];
    sessionActivityByDay: AnalyticsDailyPoint[];
    newProductsByDay?: AnalyticsDailyPoint[];
    newPromotionsByDay?: AnalyticsDailyPoint[];
  };
  distributions: {
    productsByClassification: Array<{ clasificacion: string; count: number }>;
    reviewsByRating: Array<{ rating: number; count: number }>;
    reviewsByStatus: Array<{ status: ReviewStatus; count: number }>;
  };
  topProductsByReviewsInRange: Array<{
    productId: number;
    nombre: string;
    reviewCount: number;
  }>;
};

export type CustomerClusterCode = "C1" | "C2" | "C3" | "C4";

export type CustomerSegment = {
  code: CustomerClusterCode;
  name: string;
  description: string;
  action: string;
  color: string;
  count: number;
  percentage: number;
  averages: {
    sales: number;
    rentals: number;
    interactions: number;
    spend: number;
    rentalDays: number;
    distinctProducts: number;
    inactivityDays: number;
  };
};

export type SegmentedCustomer = {
  id: number;
  name: string;
  email: string;
  cluster: CustomerClusterCode;
  views: number;
  searches: number;
  totalInteractions: number;
  distinctProducts: number;
  completedSales: number;
  unitsPurchased: number;
  validRentals: number;
  unitsRented: number;
  salesSpend: number;
  rentalSpend: number;
  totalSpend: number;
  averageRentalDays: number;
  lastActivity: string | null;
  daysSinceLastActivity: number;
  averageMonthlyActivity: number;
  interests: string[];
  engagementScore: number;
  valueScore: number;
};

export type CustomerSegmentationData = {
  generatedAt: string;
  method: string;
  sourceRows: number;
  clusters: CustomerSegment[];
  customers: SegmentedCustomer[];
};

export type DemandForecast = {
  id: number;
  productName: string;
  shortName: string;
  classification: string;
  acquisitionType: "VENTA" | "RENTA" | "MIXTO";
  active: boolean;
  price: number;
  currentStock: number;
  month: number;
  previousMonthSales: number;
  previousMonthRentals: number;
  previousMonthViews: number;
  activePromotion: boolean;
  predictedDemand: number;
  shortage: number;
  recommendation: string;
};

export type DemandForecastData = {
  generatedAt: string;
  model: {
    name: string;
    historicalRows: number;
    trainingRows: number;
    validationRows: number;
    finalTrainingRows: number;
    validationMonths: number;
    products: number;
    historicalMonths: number;
    r2: number;
    mae: number;
    rmse: number;
    forecastMonth: string | null;
    historicalThrough: string | null;
    validationFrom: string | null;
    validationTo: string | null;
  };
  forecasts: DemandForecast[];
};

export type AdminReview = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  showOnHome: boolean;
  approvedAt: string | null;
  createdAt: string;
  product: {
    id: number;
    nombre: string;
  };
  user: {
    id: number;
    nombre: string;
    correo: string;
  };
  approvedBy: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
};

export type AdminRentalRequest = {
  id: string;
  folio: string | null;
  status: RentalStatus;
  subtotal: number;
  depositTotal: number;
  depositStatus: "PENDING" | "RETURNED" | "RETAINED" | "PARTIALLY_RETAINED";
  depositReturnedAmount: number;
  depositRetainedAmount: number;
  depositNotes: string | null;
  depositResolvedAt: string | null;
  total: number;
  notes: string | null;
  applicantName: string | null;
  applicantEmail: string | null;
  applicantPhone: string | null;
  isForAnotherPerson: boolean;
  patientName: string | null;
  patientRelationship: string | null;
  deliveryMethod: "PICKUP" | "HOME_DELIVERY" | null;
  deliveryAddress: string | null;
  deliveryNeighborhood: string | null;
  deliveryPostalCode: string | null;
  deliveryMunicipality: string | null;
  deliveryReferences: string | null;
  preferredSchedule: string | null;
  rejectedReason: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    telefono: string | null;
    direccion: string | null;
  };
  approvedBy: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  statusUpdatedBy: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  depositResolvedBy: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  statusHistory: Array<{
    id: number;
    fromStatus: RentalStatus | null;
    toStatus: RentalStatus;
    note: string | null;
    createdAt: string;
    actor: {
      id: number;
      nombre: string;
      correo: string;
    } | null;
  }>;
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    startDate: string;
    endDate: string;
    days: number;
    dailyPrice: number;
    deposit: number;
    lineSubtotal: number;
    lineDeposit: number;
    lineTotal: number;
    notes: string | null;
    prescription: {
      id: string;
      fileName: string;
      mimeType: string | null;
      sizeBytes: number | null;
      status: "PENDIENTE" | "EN_REVISION" | "APROBADO" | "RECHAZADO";
      uploadedAt: string;
      associatedAt: string | null;
      reviewedAt: string | null;
      rejectionReason: string | null;
      reviewedBy: {
        id: number;
        nombre: string;
        correo: string;
      } | null;
    } | null;
    product: {
      id: number;
      nombre: string;
      marca: string;
      modelo: string;
      clasificacion: string;
      stock: number;
      tipoAdquisicion: ProductMode;
      requiereReceta: boolean;
      imageUrl: string | null;
    };
  }>;
};

export type DatabaseStatus = {
  checkedAt: string;
  isOnline: boolean;
  databaseName: string;
  dbVersion: string;
  uptimeSeconds: number;
  sizeBytes: number;
  sizePretty: string;
  connections: {
    total: number;
    active: number;
    idle: number;
  };
  transactions: {
    commits: number;
    rollbacks: number;
  };
  tables: {
    totalRows: number;
    totalSizeBytes: number;
    totalSizePretty: string;
    items: Array<{
      tableName: string;
      rowCount: number;
      sizeBytes: number;
      sizePretty: string;
    }>;
  };
  backup: {
    format: string;
    fileExtension: string;
    provider?: string;
  };
};

export type DatabaseBackupRecord = {
  id: number;
  fileName: string;
  sizeBytes: number;
  createdAt: string;
};

export type DatabaseBackupSchedule = {
  enabled: boolean;
  everyDays: number;
  runAtTime: string;
  retentionDays: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceOperation = "VACUUM" | "ANALYZE" | "VACUUM_ANALYZE";

export type MaintenanceRunResult = {
  operation: MaintenanceOperation;
  schemaName: string | null;
  tableName: string | null;
};

export type MaintenanceSchedule = {
  enabled: boolean;
  everyDays: number;
  runAtTime: string;
  operation: MaintenanceOperation;
  schemaName: string | null;
  tableName: string | null;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ActiveUserSession = {
  sessionId: string;
  userId: number;
  nombre: string;
  correo: string;
  rol: UserRole;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
};

export type LoginAuditEntry = {
  id: number;
  userId: number | null;
  nombre: string;
  correo: string;
  success: boolean;
  reason: string | null;
  attemptedAt: string;
};

export type AuthSecurityOverview = {
  activeSessions: ActiveUserSession[];
  loginAttempts: LoginAuditEntry[];
  summary: {
    activeSessions: number;
    recentAttempts: number;
    failedAttempts: number;
  };
};

export type CreateUserPayload = {
  nombre: string;
  correo: string;
  password: string;
  telefono?: string;
  direccion?: string;
  rol: UserRole;
  activo: boolean;
};

export type UpdateUserPayload = Partial<CreateUserPayload>;

export type CreateProductPayload = {
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  medidas?: string | null;
  pesoSoportado?: string | null;
  material?: string | null;
  contenidoCaja?: string | null;
  indicacionesUso?: string | null;
  precio: number;
  clasificacion: string;
  stock: number;
  proveedor: string;
  tipoAdquisicion: ProductMode;
  rentalDailyPrice?: number | null;
  rentalMinDays?: number;
  rentalDeposit?: number;
  rentalTerms?: string | null;
  requiereReceta: boolean;
  activo: boolean;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export type CreateCatalogOptionPayload = {
  nombre: string;
};

export type CreateSupplierPayload = {
  nombre: string;
  encargado: string;
  repartidor: string;
  direccion: string;
};

export type UpdateSupplierPayload = CreateSupplierPayload;

export type CreatePromotionPayload = {
  productIds: number[];
  discountPercent: number;
  imageStrategy: PromotionImageStrategy;
  startAt: string;
  endAt: string;
  descripcion: string;
};

export type UpdatePromotionPayload = Partial<CreatePromotionPayload>;

export type CreateCouponPayload = {
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  startAt: string;
  endAt: string;
  active: boolean;
};

export type UpdateCouponPayload = Partial<CreateCouponPayload>;

export type AdminActivityCategory =
  "product" | "user" | "review" | "promotion" | "supplier";

export type AdminActivityItem = {
  id: string;
  category: AdminActivityCategory;
  title: string;
  occurredAt: string;
  href: string;
};

export type AdminNotificationCategory =
  | "rental"
  | "review"
  | "inventory"
  | "sale";

export type AdminNotificationItem = {
  id: string;
  category: AdminNotificationCategory;
  title: string;
  description: string;
  occurredAt: string;
  href: string;
  readAt: string | null;
};
