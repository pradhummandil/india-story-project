import { StateRepository, stateRepository } from "@/lib/repositories/state-repository.server";

export class StateService {
  constructor(private readonly states = stateRepository) {}

  async getStateBySlug(slug: string) {
    return this.states.findBySlug(slug);
  }

  async getStates() {
    return this.states.listAll();
  }
}

export const stateService = new StateService();

