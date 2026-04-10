import { Request, Response } from 'express';
import Project from '../models/Project';
import RequestModel from '../models/Request';
import { sendHttpRequest } from '../utils/httpClient';

// ============ PROJECT CONTROLLERS ============

export async function createProject(req: Request, res: Response) {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getProjects(req: Request, res: Response) {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProject(req: Request, res: Response) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Delete all requests in this project
    await RequestModel.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// ============ REQUEST CONTROLLERS ============

export async function createRequest(req: Request, res: Response) {
  try {
    const request = await RequestModel.create(req.body);
    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getRequests(req: Request, res: Response) {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    const requests = await RequestModel.find(filter).sort({ updatedAt: -1 });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getRequest(req: Request, res: Response) {
  try {
    const request = await RequestModel.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateRequest(req: Request, res: Response) {
  try {
    const request = await RequestModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteRequest(req: Request, res: Response) {
  try {
    const request = await RequestModel.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// ============ SEND REQUEST ============

export async function sendRequest(req: Request, res: Response) {
  try {
    const { method, url, headers, params, body, auth } = req.body;

    // Build headers from array
    const headerObj: Record<string, string> = {};
    (headers || []).forEach((h: any) => {
      if (h.enabled && h.key) {
        headerObj[h.key] = h.value || '';
      }
    });

    // Build params from array
    const paramObj: Record<string, string> = {};
    (params || []).forEach((p: any) => {
      if (p.enabled && p.key) {
        paramObj[p.key] = p.value || '';
      }
    });

    // Build body data
    let data: any = undefined;
    if (body?.type && body.type !== 'none') {
      if (body.type === 'raw' || body.type === 'json') {
        data = body.raw || '';
        if (body.type === 'json' && data) {
          headerObj['Content-Type'] = 'application/json';
        }
      } else if (body.type === 'x-www-form-urlencoded') {
        const formObj: Record<string, string> = {};
        (body.formUrlEncoded || []).forEach((item: any) => {
          if (item.enabled && item.key) {
            formObj[item.key] = item.value || '';
          }
        });
        data = new URLSearchParams(formObj);
        headerObj['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (body.type === 'form-data') {
        // For form-data, we'd need to use FormData
        // This is a simplified version
        const formObj: Record<string, string> = {};
        (body.formData || []).forEach((item: any) => {
          if (item.enabled && item.key) {
            formObj[item.key] = item.value || '';
          }
        });
        data = formObj;
        headerObj['Content-Type'] = 'multipart/form-data';
      }
    }

    const responseData = await sendHttpRequest(
      method,
      url,
      headerObj,
      paramObj,
      data,
      auth
    );

    res.json(responseData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function sendAndSaveRequest(req: Request, res: Response) {
  try {
    // First update the request
    const request = await RequestModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Then send the actual HTTP request
    const { method, url, headers, params, body, auth } = req.body;

    const headerObj: Record<string, string> = {};
    (headers || []).forEach((h: any) => {
      if (h.enabled && h.key) {
        headerObj[h.key] = h.value || '';
      }
    });

    const paramObj: Record<string, string> = {};
    (params || []).forEach((p: any) => {
      if (p.enabled && p.key) {
        paramObj[p.key] = p.value || '';
      }
    });

    let data: any = undefined;
    if (body?.type && body.type !== 'none') {
      if (body.type === 'raw' || body.type === 'json') {
        data = body.raw || '';
        if (body.type === 'json' && data) {
          headerObj['Content-Type'] = 'application/json';
        }
      } else if (body.type === 'x-www-form-urlencoded') {
        const formObj: Record<string, string> = {};
        (body.formUrlEncoded || []).forEach((item: any) => {
          if (item.enabled && item.key) {
            formObj[item.key] = item.value || '';
          }
        });
        data = new URLSearchParams(formObj);
        headerObj['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (body.type === 'form-data') {
        const formObj: Record<string, string> = {};
        (body.formData || []).forEach((item: any) => {
          if (item.enabled && item.key) {
            formObj[item.key] = item.value || '';
          }
        });
        data = formObj;
        headerObj['Content-Type'] = 'multipart/form-data';
      }
    }

    const responseData = await sendHttpRequest(
      method,
      url,
      headerObj,
      paramObj,
      data,
      auth
    );

    // Save response to request
    request.response = responseData;
    await request.save();

    res.json({ request, response: responseData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
