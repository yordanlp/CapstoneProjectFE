export interface LatentEdit {
    principal_component_number: number,
    start_layer: number,
    end_layer: number,
    lower_coeff_limit: number,
    upper_coeff_limit: number
    /**
     *
     */
  
}

export interface PcaParameters {
    vector_id: string,
    latent_edits: Array<LatentEdit>
  }