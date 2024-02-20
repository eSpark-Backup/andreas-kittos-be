/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as B2 from 'backblaze-b2';
import { config } from 'dotenv';
config();

@Injectable()
export class BackblazeService {
  private readonly b2: B2;

  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.BACK_BLAZE_KEY_ID,
      applicationKey: process.env.BACK_BALZE_APP_KEY,
    });
  }

  async uploadFileFromBuffer(fileBuffer: Buffer, fileOrgName: string): Promise<B2.Response<B2.UploadFileResponse>> {
    try {
      const { data: { downloadUrl } } = await this.b2.authorize();
      const { data: { authorizationToken, uploadUrl } } = await this.b2.getUploadUrl({
        bucketId: process.env.BUCKET_ID
      });
      const { data: { fileName ,fileId} } = await this.b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        filename: `${new Date().getTime()}${fileOrgName.replace(/\s/g, '')}`,
        data: fileBuffer,
      });
      return { 
        url: `${downloadUrl}/file/${process.env.BUCKET_NAME}/${fileName}` ,
        fileId
      };
    } catch (error) {
      console.error('Error during file upload:', error.message);
    }
  }

  async deleteFile(fileName: string,fileId:string){
    try { 
    await this.b2.authorize();
    const fileDeleteRes = await this.b2.deleteFileVersion({
      fileName,
      fileId,
      bucketName: process.env.BUCKET_NAME,
    });
    return fileDeleteRes;
    }catch (error) {
      console.error('Error during file delete:', error.message);
    }
  }
}