import { getCatalog } from "../src/index"

/* TODO: EVERYTHING */

it("returns", async () => {
	expect.assertions(1)
	const result = await getCatalog("hail the sun")
	expect(result).toBeDefined()
})
