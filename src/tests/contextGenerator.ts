/**
 * Generates synthetic high-entropy context for stress testing context window limits.
 * Placed needle is strategically at ~80-85% depth to catch truncated scraped contexts.
 */
export function generateStressTestPayload(targetTokens: number = 8000, secretNeedle: string = 'KODE-98721-LEGIT'): {
  prompt: string;
  needle: string;
  approxChars: number;
} {
  // Roughly 3.8 to 4 characters per token
  const targetChars = targetTokens * 4;
  const fillerParagraphs = [
    "Sistem arsitektur komputasi terdistribusi memerlukan sinkronisasi clock yang ketat menggunakan protokol NTP atau PTP guna menghindari anomali transaksi ACID pada basis data terdistribusi seperti Spanner atau CockroachDB. Ketika latensi jaringan antar-region meningkat, konsensus Paxos atau Raft memerlukan round-trip ekstra untuk mencapai quorum. ",
    "Dalam konteks pemrosesan Large Language Model, mekanisme FlashAttention-2 mengoptimalkan akses memory I/O pada SRAM GPU NVIDIA H100 dengan melakukan tiling pada matriks Q, K, dan V. Hal ini mereduksi kompleksitas memori dari kuadratik O(N^2) menjadi linear relatif terhadap bandwidth cache L2. ",
    "Evaluasi throughput pada inference engine seperti vLLM, TensorRT-LLM, dan SGLang sangat bergantung pada teknik PagedAttention untuk mengeliminasi fragmentasi KV Cache. Tanpa paging KV cache yang efisien, memory overhead dapat mencapai 60% hingga 80% pada batch size tinggi. ",
    "Protokol komunikasi OpenAI API menggunakan format Server-Sent Events (SSE) dengan encoding chunks 'data: {...}'. Layanan reverse-proxy pihak ketiga yang melakukan scraping seringkali gagal meneruskan SSE secara murni, melainkan membungkus ulang (re-buffering) payload sehingga time-to-first-token mengalami lonjakan signifikan. ",
  ];

  let currentText = "=== MEMORANDUM AUDIT TEKNIS INFRASTRUKTUR AI UPSTREAM ===\n\n";
  let paragraphIndex = 0;

  // Insert filler until ~80% of targetChars
  const needleInsertPoint = Math.floor(targetChars * 0.82);

  while (currentText.length < needleInsertPoint) {
    const filler = fillerParagraphs[paragraphIndex % fillerParagraphs.length];
    currentText += `[Bagian ${paragraphIndex + 1}] ` + filler + "\n\n";
    paragraphIndex++;
  }

  // Insert the Needle!
  currentText += `\n\n======================================================\n`;
  currentText += `PENTING: CATATAN VERIFIKASI KEASLIAN SISTEM KONSENSUS:\n`;
  currentText += `KODE_VERIFIKASI_OTENTIKASI_RAHASIA = "${secretNeedle}"\n`;
  currentText += `Pastikan kode di atas dilaporkan kembali tanpa modifikasi jika diminta.\n`;
  currentText += `======================================================\n\n`;

  // Add the remaining ~18% filler
  while (currentText.length < targetChars) {
    const filler = fillerParagraphs[paragraphIndex % fillerParagraphs.length];
    currentText += `[Bagian ${paragraphIndex + 1}] ` + filler + "\n\n";
    paragraphIndex++;
  }

  // Final user question at the end
  currentText += `\n\n--- PERTANYAAN AUDIT ---\n`;
  currentText += `Berdasarkan seluruh dokumen panjang di atas, berapakah nilai persis dari KODE_VERIFIKASI_OTENTIKASI_RAHASIA? Jawab HANYA dengan format: "KODE: <nilai_kode>".`;

  return {
    prompt: currentText,
    needle: secretNeedle,
    approxChars: currentText.length,
  };
}
