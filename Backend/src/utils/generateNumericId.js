export async function generateNumericId(Model) {
  const lastRecord = await Model.findOne().sort({ id: -1 }).select("id").lean();
  const now = Date.now();

  if (!lastRecord?.id || lastRecord.id < now) {
    return now;
  }

  return Number(lastRecord.id) + 1;
}
