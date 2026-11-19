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

export type Product = {
  id: number;
  name: string;
  category: string;
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

  toggleCategoryStatus: (id: number) => Promise<string | null>;
  
  createSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: number, data: Omit<Supplier, "id">) => void;
  toggleSupplierStatus: (id: number) => void;
  movements: Movement[];
  setMovements: Dispatch<SetStateAction<Movement[]>>;
  registerMovement: (data: {
    productId: number;
    type: MovementType;
    quantity: number;
    responsible: string;
    reason: string;
  }) => string | null;
  createProduct: (product: Omit<Product, "id">) => void;
  purchases: Purchase[];
  setPurchases: Dispatch<SetStateAction<Purchase[]>>;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  createUser: (user: Omit<User, "id">) => void;
  updateUser: (id: number, userData: Omit<User, "id">) => void;
  toggleUserStatus: (id: number) => void;
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

  function createProduct(productData: Omit<Product, "id">) {
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);

    if (productData.quantity > 0) {
      const initialMovement: Movement = {
        id: Date.now() + 1,
        productId: newProduct.id,
        productName: newProduct.name,
        type: "ENTRY",
        quantity: productData.quantity,
        previousQuantity: 0,
        newQuantity: productData.quantity,
        date: new Date().toISOString(),
        responsible: "Cadastro do sistema",
        reason: "Estoque inicial no cadastro do produto",
      };

      setMovements((currentMovements) => [
        initialMovement,
        ...currentMovements,
      ]);
    }
  }

  function registerMovement(data: {
    productId: number;
    type: MovementType;
    quantity: number;
    responsible: string;
    reason: string;
  }): string | null {
    const product = products.find((item) => item.id === data.productId);

    if (!product) {
      return "Produto não encontrado.";
    }

    if (!product.active) {
      return "Não é possível movimentar um produto inativo.";
    }

    if (
      !Number.isFinite(data.quantity) ||
      data.quantity < 0 ||
      (data.type !== "ADJUSTMENT" && data.quantity === 0)
    ) {
      return "Informe uma quantidade válida.";
    }

    if (!data.responsible.trim() || !data.reason.trim()) {
      return "Informe o responsável e a justificativa.";
    }

    const previousQuantity = product.quantity;

    let newQuantity: number;

    switch (data.type) {
      case "ENTRY":
        newQuantity = previousQuantity + data.quantity;
        break;

      case "EXIT":
      case "LOSS":
        newQuantity = previousQuantity - data.quantity;
        break;

      case "ADJUSTMENT":
        newQuantity = data.quantity;
        break;
    }

    if (newQuantity < 0) {
      return "Estoque insuficiente para realizar essa movimentação.";
    }

    if (newQuantity === previousQuantity) {
      return "A quantidade informada não altera o estoque.";
    }

    const movement: Movement = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      type: data.type,
      quantity:
        data.type === "ADJUSTMENT"
          ? Math.abs(newQuantity - previousQuantity)
          : data.quantity,
      previousQuantity,
      newQuantity,
      date: new Date().toISOString(),
      responsible: data.responsible.trim(),
      reason: data.reason.trim(),
    };

    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === product.id ? { ...item, quantity: newQuantity } : item,
      ),
    );

    setMovements((currentMovements) => [movement, ...currentMovements]);

    return null;
  }

  function createSupplier(supplierData: Omit<Supplier, "id">) {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now(),
    };

    setSuppliers((currentSuppliers) => [...currentSuppliers, newSupplier]);
  }

  function updateSupplier(id: number, supplierData: Omit<Supplier, "id">) {
    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, ...supplierData } : supplier,
      ),
    );
  }

  function toggleSupplierStatus(id: number) {
    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((supplier) =>
        supplier.id === id
          ? { ...supplier, active: !supplier.active }
          : supplier,
      ),
    );
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

  function createUser(userData: Omit<User, "id">) {
    setUsers((currentUsers) => [
      ...currentUsers,
      {
        id: Date.now(),
        ...userData,
      },
    ]);
  }

  function updateUser(id: number, userData: Omit<User, "id">) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id ? { ...user, ...userData } : user,
      ),
    );
  }

  function toggleUserStatus(id: number) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id ? { ...user, active: !user.active } : user,
      ),
    );
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
        registerMovement,
        createProduct,
        createSupplier,
        updateSupplier,
        toggleSupplierStatus,
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