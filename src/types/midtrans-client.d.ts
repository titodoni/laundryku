declare module "midtrans-client" {
  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey?: string;
    });

    createTransaction(parameter: unknown): Promise<unknown>;
  }

  const midtransClient: {
    Snap: typeof Snap;
  };

  export default midtransClient;
}
