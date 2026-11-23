import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  getCategories,
  createCategory as createCategoryRequest,
  updateCategory as updateCategoryRequest,
  updateCategoryStatus,
} from "@/services/categoryService";


import {
  getMovements,
  createMovement as createMovementRequest,
} from "@/services/movementService";


import {
  getProducts,
  createProduct as createProductRequest,
  updateProduct as updateProductRequest,
  updateProductStatus as updateProductStatusRequest,
} from "@/services/productService";

import {
  getSuppliers,
  createSupplier as createSupplierRequest,
  updateSupplier as updateSupplierRequest,
  updateSupplierStatus as updateSupplierStatusRequest,
} from "@/services/supplierService";

import {
  getPurchases,
  createPurchase as createPurchaseRequest,
} from "@/services/purchaseService";

import {
  getUsers,
  createUser as createUserRequest,
  updateUser as updateUserRequest,
  updateUserStatus as updateUserStatusRequest,
} from "@/services/userService";

export type Product = {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  minimumStock: number;
  active: boolean;
  description?: string;
};

export type MovementType = "ENTRY" | "EXIT" | "LOSS" | "ADJUSTMENT";

export type Movement = {
  id: number;
  productId: number;
  productName: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  date: string;
  responsible: string;
  reason: string;
};

export type Supplier = {
  id: number;
  name: string;
  document: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
};

export type Category = {
  id: number;
  name: string;
  description: string;
  active: boolean;
};

export type PurchaseItem = {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
};

export type Purchase = {
  id: number;
  supplierId: number;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  status: "CONFIRMED";
};

export type UserRole = "ADMIN" | "OPERATOR";

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Detergente neutro",
    category: "Produtos de limpeza",
    quantity: 35,
    unit: "Litros",
    unitPrice: 4.5,
    minimumStock: 10,
    active: true,
    description: "Detergente neutro para limpeza geral",
  },
  {
    id: 2,
    name: "Água sanitária",
    category: "Produtos de limpeza",
    quantity: 4,
    unit: "Litros",
    unitPrice: 6.9,
    minimumStock: 10,
    active: true,
  },
  {
    id: 3,
    name: "Desinfetante",
    category: "Produtos de limpeza",
    quantity: 22,
    unit: "Litros",
    unitPrice: 8.5,
    minimumStock: 8,
    active: true,
    description: "Desinfetante para superfícies",
  },
  {
    id: 4,
    name: "Papel toalha",
    category: "Descartáveis",
    quantity: 0,
    unit: "Pacotes",
    unitPrice: 12.9,
    minimumStock: 5,
    active: true,
    description: "Papel toalha para uso doméstico",
  },
  {
    id: 5,
    name: "Sabão em pó",
    category: "Produtos de limpeza",
    quantity: 18,
    unit: "Kg",
    unitPrice: 11.5,
    minimumStock: 8,
    active: true,
    description: "Sabão em pó para lavagem",
  },
];

const initialSuppliers: Supplier[] = [];

type StockContextType = {
  products: Product[];

  setProducts: Dispatch<SetStateAction<Product[]>>;

  suppliers: Supplier[];

  setSuppliers: Dispatch<SetStateAction<Supplier[]>>;

  categories: Category[];

  setCategories: Dispatch<SetStateAction<Category[]>>;

  createCategory: (category: Omit<Category, "id">) => Promise<string | null>;

  updateCategory: (
    id: number,
    categoryData: Omit<Category, "id">,
  ) => Promise<string | null>;

  toggleProductStatus: (id: number) => Promise<string | null>;

  toggleCategoryStatus: (id: number) => Promise<string | null>;

  createSupplier: (
    supplier: Omit<Supplier, "id" | "active">,
  ) => Promise<string | null>;

  updateSupplier: (
    id: number,
    data: Omit<Supplier, "id" | "active">,
  ) => Promise<string | null>;

  toggleSupplierStatus: (id: number) => Promise<string | null>;

  movements: Movement[];

  setMovements: Dispatch<SetStateAction<Movement[]>>;

  createMovement: (data: {
    productId: number;
    type: MovementType;
    quantity: number;
    responsible: string;
    reason: string;
  }) => Promise<string | null>;

  createProduct: (product: Omit<Product, "id">) => Promise<string | null>;

  updateProduct: (
    id: number,
    productData: Omit<Product, "id" | "quantity">,
  ) => Promise<string | null>;

  purchases: Purchase[];

  setPurchases: Dispatch<SetStateAction<Purchase[]>>;

  createPurchase: (data: {
    supplierId: number;
    date: string;
    items: {
      productId: number;
      quantity: number;
      unitPrice: number;
    }[];
  }) => Promise<string | null>;

  users: User[];

  setUsers: Dispatch<SetStateAction<User[]>>;

  createUser: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }) => Promise<string | null>;

  updateUser: (
    id: number,
    userData: Omit<User, "id">,
  ) => Promise<string | null>;

  toggleUserStatus: (id: number) => Promise<string | null>;
};

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [categories, setCategories] = useState<Category[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
      }
    }

    loadSuppliers();
  }, []);

  useEffect(() => {
    async function loadPurchases() {
      try {
        const data = await getPurchases();
        setPurchases(data);
      } catch (error) {
        console.error("Erro ao carregar compras:", error);
      }
    }

    loadPurchases();
  }, []);


  useEffect(() => {
    async function loadMovements() {
      try {
        const data = await getMovements();
        setMovements(data);
      } catch (error) {
        console.error("Erro ao carregar movimentações:", error);
      }
    }

    loadMovements();
  }, []);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    }

    loadUsers();
  }, []);

  async function createProduct(
    productData: Omit<Product, "id">,
  ): Promise<string | null> {
    try {
      if (!productData.categoryId) {
        return "Selecione uma categoria válida.";
      }

      const newProduct = await createProductRequest({
        name: productData.name,
        categoryId: productData.categoryId,
        quantity: productData.quantity,
        unit: productData.unit,
        unitPrice: productData.unitPrice,
        minimumStock: productData.minimumStock,
        description: productData.description,
      });

      setProducts((currentProducts) => [...currentProducts, newProduct]);

      return null;
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao cadastrar produto.";
    }
  }

  async function updateProduct(
    id: number,
    productData: Omit<Product, "id" | "quantity">,
  ): Promise<string | null> {
    try {
      if (!productData.categoryId) {
        return "Selecione uma categoria válida.";
      }

      const updatedProduct = await updateProductRequest(id, {
        name: productData.name,
        categoryId: productData.categoryId,
        unit: productData.unit,
        unitPrice: productData.unitPrice,
        minimumStock: productData.minimumStock,
        description: productData.description,
      });

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === id ? updatedProduct : product,
        ),
      );

      return null;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao atualizar produto.";
    }
  }

  
  async function createMovement(data: {
    productId: number;
    type: MovementType;
    quantity: number;
    responsible: string;
    reason: string;
  }): Promise<string | null> {
    try {
      await createMovementRequest(data);

      // Atualiza o histórico de movimentações.
      const updatedMovements = await getMovements();
      setMovements(updatedMovements);

      // Atualiza os produtos para refletir a alteração do estoque.
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);

      return null;
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao registrar movimentação.";
    }
  }


  async function createPurchase(data: {
    supplierId: number;
    date: string;
    items: {
      productId: number;
      quantity: number;
      unitPrice: number;
    }[];
  }): Promise<string | null> {
    try {
      const newPurchase = await createPurchaseRequest(data);

      setPurchases((currentPurchases) => [newPurchase, ...currentPurchases]);

      // Atualiza os produtos para refletir as entradas da compra.
      try {
        const updatedProducts = await getProducts();
        setProducts(updatedProducts);
      } catch (refreshError) {
        console.error("Erro ao atualizar produtos:", refreshError);
      }

      return null;
    } catch (error) {
      console.error("Erro ao cadastrar compra:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao cadastrar compra.";
    }
  }

  async function toggleProductStatus(id: number): Promise<string | null> {
    try {
      const currentProduct = products.find((product) => product.id === id);

      if (!currentProduct) {
        return "Produto não encontrado.";
      }

      const updatedProduct = await updateProductStatusRequest(
        id,
        !currentProduct.active,
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === id ? updatedProduct : product,
        ),
      );

      return null;
    } catch (error) {
      console.error("Erro ao alterar status do produto:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao alterar status do produto.";
    }
  }

  async function createSupplier(
    supplierData: Omit<Supplier, "id" | "active">,
  ): Promise<string | null> {
    try {
      const newSupplier = await createSupplierRequest({
        name: supplierData.name,
        document: supplierData.document,
        contactName: supplierData.contactName,
        phone: supplierData.phone,
        email: supplierData.email,
        address: supplierData.address,
      });

      setSuppliers((currentSuppliers) => [...currentSuppliers, newSupplier]);

      return null;
    } catch (error) {
      console.error("Erro ao cadastrar fornecedor:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao cadastrar fornecedor.";
    }
  }

  async function updateSupplier(
    id: number,
    supplierData: Omit<Supplier, "id" | "active">,
  ): Promise<string | null> {
    try {
      const updatedSupplier = await updateSupplierRequest(id, {
        name: supplierData.name,
        document: supplierData.document,
        contactName: supplierData.contactName,
        phone: supplierData.phone,
        email: supplierData.email,
        address: supplierData.address,
      });

      setSuppliers((currentSuppliers) =>
        currentSuppliers.map((supplier) =>
          supplier.id === id ? updatedSupplier : supplier,
        ),
      );

      return null;
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao atualizar fornecedor.";
    }
  }

  async function toggleSupplierStatus(id: number): Promise<string | null> {
    try {
      const currentSupplier = suppliers.find((supplier) => supplier.id === id);

      if (!currentSupplier) {
        return "Fornecedor não encontrado.";
      }

      const updatedSupplier = await updateSupplierStatusRequest(
        id,
        !currentSupplier.active,
      );

      setSuppliers((currentSuppliers) =>
        currentSuppliers.map((supplier) =>
          supplier.id === id ? updatedSupplier : supplier,
        ),
      );

      return null;
    } catch (error) {
      console.error("Erro ao alterar status do fornecedor:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao alterar status do fornecedor.";
    }
  }

  async function createCategory(
    categoryData: Omit<Category, "id">,
  ): Promise<string | null> {
    try {
      const newCategory = await createCategoryRequest({
        name: categoryData.name,
        description: categoryData.description,
      });

      setCategories((currentCategories) => [...currentCategories, newCategory]);

      return null;
    } catch (error) {
      console.error("Erro ao cadastrar categoria:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao cadastrar categoria.";
    }
  }

  async function updateCategory(
    id: number,
    categoryData: Omit<Category, "id">,
  ): Promise<string | null> {
    try {
      const updatedCategory = await updateCategoryRequest(id, {
        name: categoryData.name,
        description: categoryData.description,
      });

      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === id ? updatedCategory : category,
        ),
      );

      return null;
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao atualizar categoria.";
    }
  }

  async function toggleCategoryStatus(id: number): Promise<string | null> {
    try {
      const currentCategory = categories.find((category) => category.id === id);

      if (!currentCategory) {
        return "Categoria não encontrada.";
      }

      const updatedCategory = await updateCategoryStatus(
        id,
        !currentCategory.active,
      );

      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === id ? updatedCategory : category,
        ),
      );

      return null;
    } catch (error) {
      console.error("Erro ao alterar status da categoria:", error);

      return error instanceof Error
        ? error.message
        : "Erro ao alterar status da categoria.";
    }
  }

  async function createUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<string | null> {
    try {
      const newUser = await createUserRequest(userData);

      setUsers((currentUsers) => [...currentUsers, newUser]);

      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Erro ao cadastrar usuário.";
    }
  }

  async function updateUser(
    id: number,
    userData: Omit<User, "id">,
  ): Promise<string | null> {
    try {
      const updatedUser = await updateUserRequest(id, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      });

      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === id ? updatedUser : user)),
      );

      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Erro ao atualizar usuário.";
    }
  }

  async function toggleUserStatus(id: number): Promise<string | null> {
    try {
      const currentUser = users.find((user) => user.id === id);

      if (!currentUser) {
        return "Usuário não encontrado.";
      }

      const updatedUser = await updateUserStatusRequest(
        id,
        !currentUser.active,
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === id ? updatedUser : user)),
      );

      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Erro ao alterar o status do usuário.";
    }
  }

  return (
    <StockContext.Provider
      value={{
        products,
        setProducts,
        movements,
        setMovements,
        suppliers,
        setSuppliers,
        users,
        setUsers,
        createUser,
        updateUser,
        toggleUserStatus,
        categories,
        setCategories,
        createCategory,
        updateCategory,
        toggleCategoryStatus,
        createMovement,
        createProduct,
        updateProduct,
        toggleProductStatus,
        createSupplier,
        updateSupplier,
        toggleSupplierStatus,
        createPurchase,
        purchases,
        setPurchases,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);

  if (!context) {
    throw new Error("useStock deve ser utilizado dentro de StockProvider.");
  }

  return context;
}