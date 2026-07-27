// Partial

interface Product{
    name: string;
    price:number;
    stock:number;
}

function updateProduct(product:Product, updateProduct: Partial<Product>){
    return {...product, ...updateProduct}
}

// Pick && Omit

type ProductWithoutprice = Omit<Product,"price">
type ProductNameStock = Pick<Product,"name" | "stock">


// Record
type states = "ative" | "inative"
const users: Record<states,string[]> = {
    ative:['berg', 'maria'],
    inative:['Joao']
}

// Exclude & Extract

type types =  "number" | "string" | "boolean"

type Private = Exclude<types, "boolean">

type Public = Extract<types, "string"> 

// NonNullable

type CanBeNull = string | null | undefined

type without = NonNullable<CanBeNull>

// Returntype & parameter

function greeting(name:string) {
    console.log(`ola ${name}`)
}

type Return = ReturnType<typeof greeting>
type parameter = Parameters<typeof greeting>