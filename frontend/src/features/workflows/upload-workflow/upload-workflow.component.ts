import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GraphqlService } from '../../../app/shared/graphql/services/graphql.service';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../../app/shared/components/search-bar/search-bar.component';
import { LlmService } from '../../llm-chat/llm.service';


interface Bot {
  id: string;
  name: string;
  platform: string;
  image?: string;
}

@Component({
  selector: 'app-upload-workflow',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SearchBarComponent,
  ],
  templateUrl: './upload-workflow.component.html',
  styleUrls: ['./upload-workflow.component.scss'],
})
export class UploadWorkflowComponent implements OnInit {
  workflowForm: FormGroup;
  isSubmitting = false;
  allBots: Bot[] = [];
  filteredBots: Bot[] = [];
  selectedBots: Bot[] = [];
  goalInput = '';
  recommending = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private graphqlService: GraphqlService,
    private llmService: LlmService
  ) {
    this.workflowForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      useCase: ['', Validators.required],
      isPublic: [false],
      tags: [''],
      botIds: [[]],
      configJson: ['']
    });
  }

  ngOnInit(): void {
    this.loadBots();
  }

  loadBots(): void {
    this.graphqlService.getBasicBots().subscribe({
      next: ({ data }) => {
        this.allBots = data.bots.map((bot: any) => ({
          id: bot.id,
          name: bot.name,
          platform: bot.sourcePlatform,
          image: bot.images?.find((img: any) => img.type === 'logo')?.url
        }));
        this.filteredBots = [...this.allBots];
      },
      error: (err) => console.error('Error loading bots:', err)
    });
  }

  onSearchChange(query: string): void {
    this.filteredBots = this.allBots.filter(bot =>
      bot.name.toLowerCase().includes(query.toLowerCase()) &&
      !this.selectedBots.some(selected => selected.id === bot.id)
    );
  }

  selectBot(bot: Bot): void {
    this.selectedBots.push(bot);
    this.workflowForm.patchValue({
      botIds: this.selectedBots.map(b => b.id)
    });
    this.onSearchChange('');
  }

  removeBot(botId: string): void {
    this.selectedBots = this.selectedBots.filter(b => b.id !== botId);
    this.workflowForm.patchValue({
      botIds: this.selectedBots.map(b => b.id)
    });
    this.onSearchChange('');
  }

  generateWithLlm(): void {
    if (!this.goalInput.trim()) return;
    this.recommending = true;
    const userId = 1;

    this.llmService.recommendWorkflow(userId, this.goalInput).subscribe({
      next: (res: any) => {
        const wf = res.workflow;
        if (!wf) return;

        this.workflowForm.patchValue({
          name: wf.name,
          description: wf.description,
          useCase: this.goalInput,
          tags: wf.tags.join(', '),
          configJson: JSON.stringify(wf.configJson, null, 2),
          botIds: wf.bots.map((b: any) => b.id),
        });

        this.selectedBots = wf.bots;
        this.recommending = false;
      },
      error: () => {
        console.error('Error generando workflow:');
        this.recommending = false;
      },
    });
  }

  onSubmit() {
    if (this.workflowForm.valid) {
      this.isSubmitting = true;

      let configJsonParsed = null;
      try {
        configJsonParsed = this.workflowForm.value.configJson
          ? JSON.parse(this.workflowForm.value.configJson)
          : null;
      } catch (e) {
        alert('El campo Configuración JSON no contiene un JSON válido.');
        this.isSubmitting = false;
        return;
      }

      const formData = {
        ...this.workflowForm.value,
        creatorId: 1,
        tags: this.workflowForm.value.tags
          ?.split(',')
          .map((t: string) => t.trim()) || [],
        configJson: configJsonParsed,
      };

      this.http.post('http://localhost:3000/workflow', formData).subscribe({
        next: () => this.router.navigate(['/workflows']),
        error: (err) => {
          console.error('Error:', err);
          this.isSubmitting = false;
        },
      });
    }
  }
}
