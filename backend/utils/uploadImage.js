const AWS = require("aws-sdk");
let upload = require("../helpers/s3config");

const s3Client = new AWS.S3({
  accessKeyId: "AKIAQEIP3KYCVNHZGH6M",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const uploadParams = {
  Bucket: "giftshare",
  Key: "", // pass key
  Body: null, // pass file body
  ContentType: "",
};
// ==================={UPLOAD IMAGE}====================
const UPLOAD_S3_IMAGE = async (img_name, dir, image_data) => {
  let response = {};
  let image_file_name = "";
  let savePath = dir;
  image_file_name = img_name;
  upload.single("file");
  const uploadImage = s3Client;
  const params = uploadParams;
  params.Key = savePath + image_file_name;
  params.Body = image_data;
  // Determine the content type based on the file extension
  const fileExtension = image_file_name.split(".").pop().toLowerCase();
  if (fileExtension === "png") {
    params.ContentType = "image/png";
  } else if (fileExtension === "jpg" || fileExtension === "jpeg") {
    params.ContentType = "image/jpeg";
  } else if (fileExtension === "mp4") {
    params.ContentType = "video/mp4";
  } else if (fileExtension === "pdf") {
    params.ContentType = "application/pdf";
  } else {
    // Set a default content type for other file types
    params.ContentType = "application/octet-stream";
  }
  try {
    let a = await uploadImage.upload(params).promise();
    response.image_file_name = a.Location;
  } catch (err) {
    response.status = false;
    response.error = err;
  }
  return response;
};
module.exports = { UPLOAD_S3_IMAGE };
