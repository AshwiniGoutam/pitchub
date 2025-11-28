import { getDatabase } from "@/lib/mongodb";

export async function getInvestorThesisByEmail(email) {
  const db = await getDatabase();
  return db.collection("investor_thesis").findOne({ email });
}
