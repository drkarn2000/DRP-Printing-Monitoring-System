import { Controller, Get, Post, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArtworkService } from './artwork.service';

@ApiTags('Artwork Library')
@Controller('api/artwork')
export class ArtworkController {
  constructor(private readonly artworkService: ArtworkService) {}

  @Get()
  @ApiOperation({ summary: 'List all artworks detected from server and linked to jobs' })
  async getAll(@Query('search') search?: string) {
    const data = await this.artworkService.getAll(search);
    return { success: true, data };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload artwork file or preview' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    // If file uploaded, return file path and metadata
    return {
      success: true,
      filename: file?.originalname || 'artwork.tif',
      size: file?.size || 0,
      path: file?.path || `/uploads/${file?.originalname}`,
      message: 'Artwork uploaded successfully.',
    };
  }
}
