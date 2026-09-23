import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, drugsTable } from "@workspace/db";
import {
  CreateDrugBody,
  CreateDrugResponse,
  DeleteDrugParams,
  ListDrugsQueryParams,
  ListDrugsResponse,
  SearchDrugsQueryParams,
  SearchDrugsResponse,
  UpdateDrugBody,
  UpdateDrugParams,
  UpdateDrugResponse,
  GetDashboardSummaryResponse,
} from "@workspace/api-zod";
import { getDrugStatus, matchesDrug, toDrugResponse } from "../lib/drug-utils";

const router: IRouter = Router();

async function getAllDrugRows() {
  return db.select().from(drugsTable).orderBy(asc(drugsTable.name));
}

router.get("/drugs", async (req, res): Promise<void> => {
  const parsed = ListDrugsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, status = "all" } = parsed.data;
  const rows = await getAllDrugRows();
  const filtered = rows
    .map(toDrugResponse)
    .filter((drug) => {
      const matchesSearch =
        !search ||
        matchesDrug(
          rows.find((row) => row.id === drug.id)!,
          search,
        );
      return Boolean(matchesSearch) && (status === "all" || drug.status === status);
    });

  res.json(ListDrugsResponse.parse(filtered));
});

router.post("/drugs", async (req, res): Promise<void> => {
  const parsed = CreateDrugBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [drug] = await db
    .insert(drugsTable)
    .values({
      name: parsed.data.name.trim(),
      alternativeNames: parsed.data.alternativeNames ?? [],
      brandNames: parsed.data.brandNames ?? [],
      expiryDate: parsed.data.expiryDate.toISOString().slice(0, 10),
      batchNumber: parsed.data.batchNumber ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  res.status(201).json(CreateDrugResponse.parse(toDrugResponse(drug)));
});

router.get("/drugs/search", async (req, res): Promise<void> => {
  const parsed = SearchDrugsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await getAllDrugRows();
  const matches = rows.flatMap((row) => {
    const matchedTerm = matchesDrug(row, parsed.data.q);
    if (!matchedTerm) return [];
    return [{ ...toDrugResponse(row), matchedTerm }];
  });

  res.json(SearchDrugsResponse.parse(matches));
});

router.patch("/drugs/:id", async (req, res): Promise<void> => {
  const params = UpdateDrugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateDrugBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const values = {
    ...(body.data.name === undefined ? {} : { name: body.data.name.trim() }),
    ...(body.data.alternativeNames === undefined
      ? {}
      : { alternativeNames: body.data.alternativeNames }),
    ...(body.data.brandNames === undefined ? {} : { brandNames: body.data.brandNames }),
    ...(body.data.expiryDate === undefined
      ? {}
      : { expiryDate: body.data.expiryDate.toISOString().slice(0, 10) }),
    ...(body.data.batchNumber === undefined ? {} : { batchNumber: body.data.batchNumber }),
    ...(body.data.notes === undefined ? {} : { notes: body.data.notes }),
    updatedAt: new Date(),
  };

  const [drug] = await db
    .update(drugsTable)
    .set(values)
    .where(eq(drugsTable.id, params.data.id))
    .returning();

  if (!drug) {
    res.status(404).json({ error: "Drug not found" });
    return;
  }

  res.json(UpdateDrugResponse.parse(toDrugResponse(drug)));
});

router.delete("/drugs/:id", async (req, res): Promise<void> => {
  const params = DeleteDrugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [drug] = await db
    .delete(drugsTable)
    .where(eq(drugsTable.id, params.data.id))
    .returning({ id: drugsTable.id });

  if (!drug) {
    res.status(404).json({ error: "Drug not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const rows = await getAllDrugRows();
  const counts = rows.reduce(
    (acc, row) => {
      const status = getDrugStatus(
        toDrugResponse(row).daysUntilExpiry,
      );
      acc[status] += 1;
      return acc;
    },
    { good: 0, expiring: 0, expired: 0 },
  );

  res.json(
    GetDashboardSummaryResponse.parse({
      total: rows.length,
      ...counts,
      updatedAt: new Date(),
    }),
  );
});

export default router;