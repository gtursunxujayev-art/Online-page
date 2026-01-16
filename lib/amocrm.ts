import axios from 'axios';
import type { Lead } from '@/shared/schema';

interface AmoCRMConfig {
  subdomain: string;
  accessToken: string;
  pipelineId?: number;
  statusId?: number;
}

interface AmoCRMContact {
  id?: number;
  name: string;
  custom_fields_values?: Array<{
    field_id: number;
    values: Array<{ value: string }>;
  }>;
}

interface AmoCRMLead {
  id?: number;
  name: string;
  price?: number;
  pipeline_id?: number;
  status_id?: number;
  _embedded?: {
    contacts?: Array<{ id: number }>;
  };
}

interface SyncResult {
  success: boolean;
  leadId?: number;
  error?: string;
}

// Get AmoCRM configuration from environment
function getAmoCRMConfig(): AmoCRMConfig | null {
  const subdomain = process.env.AMOCRM_SUBDOMAIN;
  const accessToken = process.env.AMOCRM_ACCESS_TOKEN;
  const pipelineId = process.env.AMOCRM_PIPELINE_ID ? parseInt(process.env.AMOCRM_PIPELINE_ID) : undefined;
  const statusId = process.env.AMOCRM_STATUS_ID ? parseInt(process.env.AMOCRM_STATUS_ID) : undefined;

  if (!subdomain || !accessToken) {
    console.warn('AmoCRM configuration missing. Set AMOCRM_SUBDOMAIN and AMOCRM_ACCESS_TOKEN environment variables.');
    return null;
  }

  return { subdomain, accessToken, pipelineId, statusId };
}

// Create or update contact in AmoCRM
async function createOrUpdateContact(config: AmoCRMConfig, lead: Lead): Promise<number | null> {
  try {
    const apiUrl = `https://${config.subdomain}.amocrm.ru/api/v4/contacts`;
    
    // Search for existing contact by phone
    const searchResponse = await axios.get(`${apiUrl}?query=${encodeURIComponent(lead.phone)}`, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
      },
    });

    let contactId: number;

    if (searchResponse.data._embedded?.contacts?.length > 0) {
      // Update existing contact
      contactId = searchResponse.data._embedded.contacts[0].id;
      const contactData: AmoCRMContact = {
        name: lead.name,
        custom_fields_values: [
          {
            field_id: 1112329, // Phone field ID (common in AmoCRM)
            values: [{ value: lead.phone }],
          },
          {
            field_id: 1416915, // Position/Job field ID
            values: [{ value: lead.job }],
          },
        ],
      };

      await axios.patch(`${apiUrl}/${contactId}`, contactData, {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Create new contact
      const contactData: AmoCRMContact = {
        name: lead.name,
        custom_fields_values: [
        {
          field_id: 1112329, // Phone field ID
          values: [{ value: lead.phone }],
        },
        {
          field_id: 1416915, // Position/Job field ID
          values: [{ value: lead.job }],
        },
        ],
      };

      const createResponse = await axios.post(apiUrl, [contactData], {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      contactId = createResponse.data._embedded.contacts[0].id;
    }

    return contactId;
  } catch (error) {
    console.error('Failed to create/update contact in AmoCRM:', error);
    return null;
  }
}

// Create lead in AmoCRM
async function createLeadInAmoCRM(config: AmoCRMConfig, lead: Lead, contactId: number): Promise<number | null> {
  try {
    const apiUrl = `https://${config.subdomain}.amocrm.ru/api/v4/leads`;
    
    const leadData: AmoCRMLead = {
      name: `Lead from ${lead.source}: ${lead.name}`,
      pipeline_id: config.pipelineId || 0, // Default pipeline
      status_id: config.statusId || 0, // Default status
      _embedded: {
        contacts: [{ id: contactId }],
      },
    };

    const response = await axios.post(apiUrl, [leadData], {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data._embedded.leads[0].id;
  } catch (error) {
    console.error('Failed to create lead in AmoCRM:', error);
    return null;
  }
}

// Main function to sync lead to AmoCRM
export async function syncLeadToAmoCRM(lead: Lead): Promise<SyncResult> {
  const config = getAmoCRMConfig();
  if (!config) {
    return { success: false, error: 'AmoCRM not configured' };
  }

  try {
    // Step 1: Create or update contact
    const contactId = await createOrUpdateContact(config, lead);
    if (!contactId) {
      return { success: false, error: 'Failed to create contact' };
    }

    // Step 2: Create lead
    const leadId = await createLeadInAmoCRM(config, lead, contactId);
    if (!leadId) {
      return { success: false, error: 'Failed to create lead' };
    }

    return { success: true, leadId };
  } catch (error) {
    console.error('AmoCRM sync failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Get pipelines from AmoCRM (for admin configuration)
export async function getAmoCRMPipelines(): Promise<any[]> {
  const config = getAmoCRMConfig();
  if (!config) {
    return [];
  }

  try {
    const apiUrl = `https://${config.subdomain}.amocrm.ru/api/v4/leads/pipelines`;
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
      },
    });

    return response.data._embedded.pipelines || [];
  } catch (error) {
    console.error('Failed to fetch pipelines from AmoCRM:', error);
    return [];
  }
}

// Get statuses for a pipeline
export async function getAmoCRMStatuses(pipelineId: number): Promise<any[]> {
  const config = getAmoCRMConfig();
  if (!config) {
    return [];
  }

  try {
    const apiUrl = `https://${config.subdomain}.amocrm.ru/api/v4/leads/pipelines/${pipelineId}/statuses`;
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
      },
    });

    return response.data._embedded.statuses || [];
  } catch (error) {
    console.error('Failed to fetch statuses from AmoCRM:', error);
    return [];
  }
}