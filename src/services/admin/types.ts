export type UserRole = "ADMIN" | "CLIENT";
export type ProductMode = "VENTA" | "RENTA" | "MIXTO";
export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "DELIVERED"
  | "RETURNED";

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

export type PromotionMode = "PRODUCT" | "CATEGORY";

export type AdminPromotion = {
  id: number;
  productId: number;
  descripcion: string;
  startAt: string;
  endAt: string;
  imageUrl: string | null;
  createdAt?: string;
  product: {
    id: number;
    nombre: string;
    clasificacion: string;
    precio: number;
    stock: number;
    activo: boolean;
  };
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
  status: RentalStatus;
  subtotal: number;
  depositTotal: number;
  total: number;
  notes: string | null;
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
      fileName: string;
      mimeType: string | null;
      sizeBytes: number | null;
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
  mode: PromotionMode;
  productId?: number;
  clasificacion?: string;
  startAt: string;
  endAt: string;
  descripcion: string;
  imageUrl?: string;
};

export type UpdatePromotionPayload = {
  productId?: number;
  startAt?: string;
  endAt?: string;
  descripcion?: string;
  imageUrl?: string;
};

export type AdminActivityCategory =
  | "product"
  | "user"
  | "review"
  | "promotion"
  | "supplier";

export type AdminActivityItem = {
  id: string;
  category: AdminActivityCategory;
  title: string;
  occurredAt: string;
  href: string;
};
