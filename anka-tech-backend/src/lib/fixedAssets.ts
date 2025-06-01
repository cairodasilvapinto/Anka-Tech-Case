// src/lib/fixedAssets.ts
export interface FixedAsset {
  name: string;
  value: number;
}

export const getFixedAssets = (): FixedAsset[] => {
  return [
    { name: 'Ação XYZ', value: 150.75 },
    { name: 'Fundo ABC', value: 320.50 },
    { name: 'Tesouro Direto IPCA+ 2045', value: 105.22 },
    { name: 'CDB Liquidez Diária BankX', value: 100.00 },
    // Adicione mais ativos fixos aqui se desejar
  ];
};