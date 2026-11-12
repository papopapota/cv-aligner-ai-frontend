import { cvUploadResponseSchema, type CvUploadResponse } from "@/entities/cv"
import { postFormData } from "@/shared/api"

export async function uploadCv(cvFile: File): Promise<CvUploadResponse> {
  const formData = new FormData()
  formData.append("cv_file", cvFile)

  return postFormData({
    url: "/cvs",
    formData,
    schema: cvUploadResponseSchema,
  })
}
