/**
 * Trust Verifier - Core logic for endpoint verification and TrustScore calculation
 */

import { getCryptoPrices } from "./data-sources";

interface VerifyInput {
  endpoint_url: string;
  test_query: Record<string, any>;
  endpoint_type?: string;
  comparison_sources?: string[];
}

interface VerifyResult {
  accuracy_score: number;
  latency_score: number;
  reliability_score: number;
  overall_trust_score: number;
  grade: string;
  recommendation: "TRUSTED" | "CAUTION" | "AVOID";
  badge: string;
  endpoint_response: any;
  latency_ms: number;
  status_code: number;
  error?: string;
}

/**
 * Main endpoint verification function
 */
export async function verifyEndpoint(input: VerifyInput): Promise<VerifyResult> {
  const startTime = Date.now();

  try {
    // Step 1: Call the target endpoint
    const response = await fetch(input.endpoint_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input.test_query),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const latency_ms = Date.now() - startTime;
    const status_code = response.status;

    // Step 2: Parse response
    let endpoint_response: any;
    try {
      endpoint_response = await response.json();
    } catch (e) {
      endpoint_response = await response.text();
    }

    // Step 3: Calculate scores
    const latency_score = calculateLatencyScore(latency_ms);
    const reliability_score = calculateReliabilityScore(status_code, response.ok);

    // Step 4: Calculate accuracy score (if comparison sources available)
    let accuracy_score = 85; // Default baseline for successful responses

    if (
      input.endpoint_type === "crypto-price" &&
      input.comparison_sources?.includes("pulseapi")
    ) {
      accuracy_score = await calculateAccuracyScore(
        endpoint_response,
        input.test_query
      );
    }

    // Step 5: Calculate overall TrustScore
    const overall_trust_score = calculateOverallTrustScore(
      accuracy_score,
      latency_score,
      reliability_score
    );

    // Step 6: Assign grade and recommendation
    const grade = calculateGrade(overall_trust_score);
    const recommendation = calculateRecommendation(overall_trust_score);
    const badge = getBadge(overall_trust_score);

    return {
      accuracy_score,
      latency_score,
      reliability_score,
      overall_trust_score,
      grade,
      recommendation,
      badge,
      endpoint_response,
      latency_ms,
      status_code,
    };
  } catch (error: any) {
    // Endpoint failed completely
    return {
      accuracy_score: 0,
      latency_score: 0,
      reliability_score: 0,
      overall_trust_score: 0,
      grade: "F",
      recommendation: "AVOID",
      badge: "❌ Failed Verification",
      endpoint_response: null,
      latency_ms: Date.now() - startTime,
      status_code: 0,
      error: error.message || "Endpoint unreachable",
    };
  }
}

/**
 * Calculate latency score (0-100) based on response time
 * Excellent: <200ms = 95-100
 * Good: 200-500ms = 85-95
 * Average: 500-1000ms = 70-85
 * Slow: 1000-3000ms = 50-70
 * Very Slow: >3000ms = 0-50
 */
function calculateLatencyScore(latency_ms: number): number {
  if (latency_ms < 200) return 95 + (200 - latency_ms) / 40; // 95-100
  if (latency_ms < 500) return 85 + ((500 - latency_ms) / 300) * 10; // 85-95
  if (latency_ms < 1000) return 70 + ((1000 - latency_ms) / 500) * 15; // 70-85
  if (latency_ms < 3000) return 50 + ((3000 - latency_ms) / 2000) * 20; // 50-70
  return Math.max(0, 50 - ((latency_ms - 3000) / 2000) * 10); // 0-50
}

/**
 * Calculate reliability score based on HTTP status and success
 */
function calculateReliabilityScore(status_code: number, ok: boolean): number {
  if (ok && status_code === 200) return 100;
  if (ok && status_code < 300) return 95;
  if (status_code === 429) return 60; // Rate limited
  if (status_code >= 400 && status_code < 500) return 30; // Client error
  if (status_code >= 500) return 10; // Server error
  return 50; // Unknown
}

/**
 * Calculate accuracy score by comparing endpoint response with PulseAPI data
 */
async function calculateAccuracyScore(
  endpoint_response: any,
  test_query: Record<string, any>
): Promise<number> {
  try {
    // Get our own data for comparison
    const pulseData = await getCryptoPrices({
      symbols: test_query.symbols || ["bitcoin"],
      vsCurrency: test_query.vsCurrency || "usd",
    });

    // Compare prices
    if (!endpoint_response?.data && !Array.isArray(endpoint_response)) {
      return 50; // Can't compare, give neutral score
    }

    const endpointPrices = Array.isArray(endpoint_response)
      ? endpoint_response
      : endpoint_response.data || [];
    const pulsePrices = pulseData.prices;

    if (endpointPrices.length === 0 || pulsePrices.length === 0) {
      return 60; // Some data, but incomplete
    }

    // Calculate deviation percentage
    let totalDeviation = 0;
    let comparisons = 0;

    for (const endpointPrice of endpointPrices) {
      const symbol = endpointPrice.symbol?.toLowerCase() || endpointPrice.name?.toLowerCase();
      const pulsePrice = pulsePrices.find(
        (p: any) =>
          p.symbol?.toLowerCase() === symbol || p.name?.toLowerCase() === symbol
      );

      if (pulsePrice && endpointPrice.price && pulsePrice.price) {
        const deviation =
          Math.abs(endpointPrice.price - pulsePrice.price) / pulsePrice.price;
        totalDeviation += deviation;
        comparisons++;
      }
    }

    if (comparisons === 0) {
      return 55; // Data structure mismatch
    }

    const avgDeviation = totalDeviation / comparisons;

    // Score based on deviation
    // 0-1% deviation = 95-100 points
    // 1-3% deviation = 85-95 points
    // 3-5% deviation = 70-85 points
    // 5-10% deviation = 50-70 points
    // >10% deviation = 0-50 points

    if (avgDeviation < 0.01) return 95 + (0.01 - avgDeviation) * 500;
    if (avgDeviation < 0.03)
      return 85 + ((0.03 - avgDeviation) / 0.02) * 10;
    if (avgDeviation < 0.05)
      return 70 + ((0.05 - avgDeviation) / 0.02) * 15;
    if (avgDeviation < 0.1)
      return 50 + ((0.1 - avgDeviation) / 0.05) * 20;
    return Math.max(0, 50 - ((avgDeviation - 0.1) / 0.1) * 50);
  } catch (error) {
    console.error("Accuracy calculation error:", error);
    return 70; // Default to neutral-positive if comparison fails
  }
}

/**
 * Calculate overall TrustScore using weighted formula
 * Formula: accuracy (40%) + latency (30%) + reliability (30%)
 */
function calculateOverallTrustScore(
  accuracy: number,
  latency: number,
  reliability: number
): number {
  const score = accuracy * 0.4 + latency * 0.3 + reliability * 0.3;
  return Math.round(score * 10) / 10; // Round to 1 decimal
}

/**
 * Assign letter grade based on TrustScore
 */
function calculateGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "D";
  return "F";
}

/**
 * Provide usage recommendation
 */
function calculateRecommendation(
  score: number
): "TRUSTED" | "CAUTION" | "AVOID" {
  if (score >= 80) return "TRUSTED";
  if (score >= 60) return "CAUTION";
  return "AVOID";
}

/**
 * Get trust badge based on score
 */
function getBadge(score: number): string {
  if (score >= 98) return "🏆 Platinum Verified";
  if (score >= 95) return "🥇 Gold Verified";
  if (score >= 90) return "🥈 Silver Verified";
  if (score >= 80) return "🥉 Bronze Verified";
  if (score >= 70) return "✅ Basic Verified";
  if (score >= 60) return "⚠️ Use With Caution";
  return "❌ Not Recommended";
}
