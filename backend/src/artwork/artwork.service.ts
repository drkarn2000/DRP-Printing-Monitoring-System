import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class ArtworkService {
  constructor(private readonly jobsService: JobsService) {}

  async getAll(search?: string) {
    const jobs = await this.jobsService.getAll();
    let artworks = jobs.map((j) => ({
      id: j.id,
      art: j.art,
      artworkImage: j.artworkImage,
      customer: j.customer,
      dealer: j.dealer,
      dims: j.dims,
      format: j.format,
      status: j.status,
    }));

    if (search) {
      const s = search.toLowerCase();
      artworks = artworks.filter((a) => `${a.art} ${a.id} ${a.customer}`.toLowerCase().includes(s));
    }

    return artworks;
  }
}
