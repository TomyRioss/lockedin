import { neon } from "@neondatabase/serverless";

let client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set");
    }
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

export function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, any>[]> {
  return getClient()(strings, ...values) as Promise<Record<string, any>[]>;
}

export type SessionRow = {
  id: number;
  clock_in: string;
  clock_out: string | null;
  status: string;
};

export type BreakRow = {
  id: number;
  session_id: number;
  break_in: string;
  break_out: string | null;
  status: string;
};
