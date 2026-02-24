// src/lib/db/queries.ts — Database access layer

import { getSupabaseAdmin } from "./supabase";
import type { SajuInput, SajuResult, ReportResult } from "@/lib/saju/types";

// ─── Types ───

export interface DbReport {
  id: string;
  user_id: string | null;
  saju_hash: string;
  input_json: SajuInput;
  saju_result: SajuResult;
  report_json: ReportResult | null;
  report_type: string;
  tier: string;
  created_at: string;
}

export interface DbPayment {
  id: string;
  user_id: string | null;
  report_id: string | null;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  payment_key: string | null;
  order_id: string;
  paid_at: string | null;
  created_at: string;
}

// ─── Reports ───

export async function createReport(params: {
  userId?: string;
  sajuHash: string;
  input: SajuInput;
  sajuResult: SajuResult;
  reportJson?: ReportResult;
  reportType?: string;
  tier?: string;
}): Promise<DbReport> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("reports")
    .insert({
      user_id: params.userId ?? null,
      saju_hash: params.sajuHash,
      input_json: params.input,
      saju_result: params.sajuResult,
      report_json: params.reportJson ?? null,
      report_type: params.reportType ?? "full",
      tier: params.tier ?? "free",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create report: ${error.message}`);
  return data as DbReport;
}

export async function getReport(id: string): Promise<DbReport | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as DbReport;
}

export async function updateReportJson(
  id: string,
  reportJson: ReportResult,
  tier?: string
): Promise<void> {
  const db = getSupabaseAdmin();
  const update: Record<string, unknown> = { report_json: reportJson };
  if (tier) update.tier = tier;

  const { error } = await db.from("reports").update(update).eq("id", id);
  if (error) throw new Error(`Failed to update report: ${error.message}`);
}

export async function updateReportTier(id: string, tier: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("reports").update({ tier }).eq("id", id);
  if (error) throw new Error(`Failed to update report tier: ${error.message}`);
}

export async function getReportsByUser(userId: string): Promise<DbReport[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch reports: ${error.message}`);
  return (data ?? []) as DbReport[];
}

export async function linkReportToUser(reportId: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("reports")
    .update({ user_id: userId })
    .eq("id", reportId);
  if (error) throw new Error(`Failed to link report: ${error.message}`);
}

// ─── Payments ───

export async function createPayment(params: {
  userId?: string;
  reportId: string;
  amount: number;
  orderId: string;
}): Promise<DbPayment> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("payments")
    .insert({
      user_id: params.userId ?? null,
      report_id: params.reportId,
      amount: params.amount,
      order_id: params.orderId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create payment: ${error.message}`);
  return data as DbPayment;
}

export async function confirmPayment(
  orderId: string,
  paymentKey: string
): Promise<DbPayment> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("payments")
    .update({
      status: "confirmed",
      payment_key: paymentKey,
      paid_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) throw new Error(`Failed to confirm payment: ${error.message}`);
  return data as DbPayment;
}

export async function getPaymentByOrderId(orderId: string): Promise<DbPayment | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error) return null;
  return data as DbPayment;
}

export async function getPaymentsByReport(reportId: string): Promise<DbPayment[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("payments")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as DbPayment[];
}

// ─── Cache ───

export async function getCachedSection(
  sajuHash: string,
  sectionKey: string
): Promise<unknown | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("report_cache")
    .select("content")
    .eq("saju_hash", sajuHash)
    .eq("section_key", sectionKey)
    .single();

  if (error) return null;
  return data?.content ?? null;
}

export async function setCachedSection(
  sajuHash: string,
  sectionKey: string,
  content: unknown
): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("report_cache").upsert({
    saju_hash: sajuHash,
    section_key: sectionKey,
    content,
  });
  if (error) {
    console.error("Cache write failed:", error.message);
  }
}
