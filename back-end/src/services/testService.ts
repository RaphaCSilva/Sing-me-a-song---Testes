import { reset } from "../repositories/testRepository.js";

export async function resetDatabase() {
    await reset();
}