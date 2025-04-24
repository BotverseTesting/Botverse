import { Component, OnInit } from '@angular/core';
import { Workflow, WorkflowService } from './workflow.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workflow-marketplace',
  standalone: true,
  templateUrl: './workflow-marketplace.component.html',
  styleUrls: ['./workflow-marketplace.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class WorkflowMarketplaceComponent implements OnInit {
  workflows: Workflow[] = [];
  filteredWorkflows: Workflow[] = [];
  isLoading = true;
  error: string | null = null;
  
  searchQuery = '';
  availableTags: string[] = [];
  selectedTags: string[] = [];

  // Modal
  showModal = false;
  selectedWorkflow: Workflow | null = null;

  // Colores pastel para las tags
  private pastelColors = [
    '#FFD1DC', '#FFECB8', '#B5EAD7', '#C7CEEA', 
    '#E2F0CB', '#FFDAC1', '#B5EAD7', '#FDDFDF',
    '#F8E8E8', '#E8F4F8', '#F0FFF0', '#FFF8E1'
  ];

  constructor(private workflowService: WorkflowService) {}

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.isLoading = true;
    this.error = null;
    
    this.workflowService.getAllWorkflows().subscribe({
      next: (workflows) => {
        this.workflows = workflows;
        this.filteredWorkflows = [...workflows];
        this.extractAvailableTags();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los workflows';
        this.isLoading = false;
        console.error('Error loading workflows:', err);
      }
    });
  }

  extractAvailableTags(): void {
    const allTags = this.workflows.flatMap(w => w.tags);
    this.availableTags = [...new Set(allTags)].sort();
  }

  applyFilters(): void {
    this.filteredWorkflows = this.workflows.filter(workflow => {
      const matchesSearch = !this.searchQuery || 
        workflow.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        workflow.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesTags = this.selectedTags.length === 0 || 
        this.selectedTags.some(tag => workflow.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }

  toggleTagFilter(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
    this.applyFilters();
  }

  getTagColor(index: number): string {
    return this.pastelColors[index % this.pastelColors.length];
  }

  // Métodos para el modal
  openModal(workflow: Workflow): void {
    this.selectedWorkflow = workflow;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedWorkflow = null;
    document.body.style.overflow = 'auto';
  }

  truncateDescription(description: string, maxLength: number = 100): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  formatObject(obj: any): string {
    try {
      if (typeof obj === 'string') {
        return JSON.stringify(JSON.parse(obj), null, 2);
      }
      return JSON.stringify(obj, null, 2);
    } catch (e) {
     
      return obj?.toString() || 'No hay datos de configuración';
    }
  }
}