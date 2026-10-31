import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';

export interface WorkflowStage {
  title: string;
  detail: string;
  event: string;
  desc: string;
}

export interface WorkflowLog {
  stage: number;
  time: string;
  title: string;
  desc: string;
}

@Injectable()
export class WorkflowService {
  private currentStep = 0;
  private selectedJobId = 'DRP-26084';
  private selectedMachineId = 'M06';

  private readonly stages: WorkflowStage[] = [
    {
      title: 'Artwork available on network',
      detail: 'Artwork detected in \\\\MACHINEROOM date-wise folder.',
      event: 'Artwork detected on network folder',
      desc: 'Sample artwork record discovered and matched to the selected job.',
    },
    {
      title: 'File staged on local G: drive',
      detail: 'File copied to the matching local date folder.',
      event: 'Local staging record',
      desc: 'Simulated file path: G:\\2026\\October\\29\\dealer_banner_oct.tif',
    },
    {
      title: 'MainTop RIP processed',
      detail: 'Artwork imported; size, rotation, scale, resolution and pass settings applied.',
      event: 'RIP processing record',
      desc: 'MainTop processing marked complete in demo; no software was contacted.',
    },
    {
      title: '.PRN output generated',
      detail: 'RIP output saved for PrintExp.',
      event: 'PRN output record',
      desc: 'Sample output: dealer_banner_oct.prn',
    },
    {
      title: 'PrintExp job loaded / command issued',
      detail: 'Job loaded; margins, heads, speed and direction configured.',
      event: 'PrintExp job event',
      desc: 'Command event is not proof that physical pieces were produced.',
    },
    {
      title: 'Production count reconciled',
      detail: 'Compare required target, available counter and verified physical output.',
      event: 'Production reconciliation',
      desc: 'Demo output reconciled at 760 of 1,000; physical counter remains unverified.',
    },
  ];

  private logs: WorkflowLog[] = [
    {
      stage: 0,
      time: '09:31:04',
      title: 'Artwork record matched',
      desc: 'Sample event · filename matched to DRP-26084',
    },
  ];

  constructor(private readonly jobsService: JobsService) {}

  async getState() {
    const job = await this.jobsService.getById(this.selectedJobId).catch(() => null);
    return {
      currentStep: this.currentStep,
      totalSteps: this.stages.length,
      selectedJobId: this.selectedJobId,
      selectedMachineId: this.selectedMachineId,
      job,
      stages: this.stages,
      logs: this.logs,
      confidence: {
        artworkMatch: 'Matched · demo',
        ripStatus: this.currentStep >= 3 ? 'PRN recorded · demo' : this.currentStep >= 2 ? 'RIP complete · demo' : 'Waiting',
        printStatus: this.currentStep >= 5 ? 'Command recorded · demo' : this.currentStep >= 4 ? 'Job loaded · demo' : 'Waiting',
        physicalStatus: 'Unverified · Requires machine counter comparison',
      },
    };
  }

  async advanceStep() {
    if (this.currentStep < this.stages.length) {
      const stage = this.stages[this.currentStep];
      this.logs.unshift({
        stage: this.currentStep,
        time: new Date().toLocaleTimeString('en-GB'),
        title: stage.event,
        desc: stage.desc,
      });
      this.currentStep++;
    }
    return this.getState();
  }

  async reset() {
    this.currentStep = 0;
    this.logs = [
      {
        stage: 0,
        time: new Date().toLocaleTimeString('en-GB'),
        title: 'Workflow demo reset',
        desc: 'Ready to step through the simulated process again.',
      },
    ];
    return this.getState();
  }

  async selectJob(jobId: string) {
    this.selectedJobId = jobId;
    return this.getState();
  }

  async selectMachine(machineId: string) {
    this.selectedMachineId = machineId;
    return this.getState();
  }
}
