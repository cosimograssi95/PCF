# HoverEventControl

## Overview

This Plugin implements **cascade retrieval of status and status reason** for a set of parent records and their related children in Microsoft Dataverse.  
It is intended to be used in combination with **Power Automate**,**Client Sdk** by performing **bulk status updates** via **bulk messages** or **batch API**.
---

## How It Works

Given a list of **parent record GUIDs** and input parameters, the Plugin:

1. Retrieves the **status** and **status reason** for parent records.
2. Recursively collects child relationships based on the `publisherPrefix` or `entitiesLogicalNamesToInclude`.
3. Collects the **current or previous states** of all related records, depending on `shouldRestorePreviousStatus`.
4. Returns all records and their statuses in a expando object, ready for further use.

> ⚠️ The plugin does **not perform any updates**. It only returns the required records and data.


![hovermenu mp4](https://github.com/user-attachments/assets/06bdef26-daed-44fa-9a44-d9453e609e9b)
![hovericon mp4](https://github.com/user-attachments/assets/3503f384-b7ca-4f7e-81b9-483f271b1d1e)
