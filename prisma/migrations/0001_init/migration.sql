-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "concepto" TEXT NOT NULL,
    "coste" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'CHF',
    "fecha" TIMESTAMP(3) NOT NULL,
    "tema" TEXT NOT NULL,
    "eurChf" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "costeChf" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingreso" (
    "id" SERIAL NOT NULL,
    "concepto" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ingreso_pkey" PRIMARY KEY ("id")
);
