const JOB_DESCRIPTION_FILENAME = "job-description.txt"

export function createJobDescriptionFile(description: string): File {
  return new File([description], JOB_DESCRIPTION_FILENAME, {
    type: "text/plain",
  })
}
