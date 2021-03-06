import cloudinary from "cloudinary";
import { ApolloServerFileUploads } from "./index";

type CloudinaryUploadConfig = {
  cloudName: string;
  apiKey: any;
  apiSecret: string;
};

console.log(cloudinary.v2.utils.api_url);

export class CloudinaryUploader implements ApolloServerFileUploads.IUploader {
  constructor(config: CloudinaryUploadConfig) {
    cloudinary.v2.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
  }

  private createUploadStream(fileName: string, cb: Function): any {
    return cloudinary.v2.uploader.upload_stream(
      /**
       * We need a ts-ignore on the next line because for v2,
       * the order of params for upload_stream is reversed.
       */

      //@ts-ignore
      { public_id: fileName },
      (error, file) => cb(error, file)
    );
  }

  async singleFileUploadResolver(
    _parent: any,
    { file }: { file: ApolloServerFileUploads.File }
  ): Promise<ApolloServerFileUploads.UploadedFileResponse> {
    const { stream, filename, mimetype, encoding } = await file;

    return new Promise((resolve, reject) => {
      const uploadStream = this.createUploadStream(
        filename,
        (error: any, result: any) => {
          if (error) return reject(error);
          return resolve({
            filename,
            mimetype,
            encoding,
            url: result.secure_url,
          } as ApolloServerFileUploads.UploadedFileResponse);
        }
      );

      stream!.pipe(uploadStream);
    });
  }

  async multipleUploadsResolver(
    _parent: any,
    { files }: { files: ApolloServerFileUploads.File[] }
  ): Promise<ApolloServerFileUploads.UploadedFileResponse[]> {
    return Promise.all(
      files.map((f) => this.singleFileUploadResolver(null, { file: f }))
    );
  }
}
