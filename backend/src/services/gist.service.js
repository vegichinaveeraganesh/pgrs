/**
 * Gist Preparation Service
 * Provides automated deterministic summary generation, with adapter hook for AI models.
 */
class GistService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'deterministic';
  }

  /**
   * Deterministic summary generator based on key application attributes
   */
  generateDeterministicGist(grievance) {
    const { category, mandal, village, description, subject, applicant_name } = grievance;
    const cleanDesc = (description || '').trim();

    // Concise gist formulation
    let summary = `${category} grievance from ${village} village, ${mandal} mandal`;
    if (applicant_name) {
      summary += ` filed by ${applicant_name}`;
    }
    summary += `: ${subject ? subject + '. ' : ''}${cleanDesc}`;

    if (summary.length > 280) {
      return summary.substring(0, 277) + '...';
    }
    return summary;
  }

  /**
   * Main entry point for generating or regenerating gist
   */
  async generateGist(grievance, options = {}) {
    if (this.provider === 'openai' && process.env.OPENAI_API_KEY) {
      // Future pluggable AI integration
      return {
        gist: this.generateDeterministicGist(grievance),
        provider: 'openai',
        isAiGenerated: true
      };
    }

    return {
      gist: this.generateDeterministicGist(grievance),
      provider: 'deterministic_rule_based',
      isAiGenerated: false
    };
  }
}

module.exports = new GistService();
