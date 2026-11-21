import { jobUrlSchema } from "./url-schema"

describe("jobUrlSchema", () => {
  it("acepta URLs http y https", () => {
    expect(jobUrlSchema.safeParse({ url: "https://example.com/job" }).success).toBe(
      true
    )
    expect(jobUrlSchema.safeParse({ url: "http://example.com/job" }).success).toBe(
      true
    )
  })

  it("rechaza otros protocolos", () => {
    expect(jobUrlSchema.safeParse({ url: "ftp://example.com/job" }).success).toBe(
      false
    )
    expect(jobUrlSchema.safeParse({ url: "example.com/job" }).success).toBe(false)
  })
})
