# HoverEventControl

## Overview

This PCF implements **hover event** for Power Apps controls.  
It allows developers to trigger event like custom tooltips, animations and more on mouse hover.

![hovermenu mp4](https://github.com/user-attachments/assets/06bdef26-daed-44fa-9a44-d9453e609e9b)
![hovericon mp4](https://github.com/user-attachments/assets/3503f384-b7ca-4f7e-81b9-483f271b1d1e)

---

## How to create and use the PCF

### Clone the repository

```bash
git clone https://github.com/cosimograssi95/PCF.git
```

```bash
cd PCF/{PCFControlName}

npm install
```

### Create Solution

If you have PAC CLI installed you can download the tool with

```bash
pac solution init --publisher-name {YouPublisherName} --publisher-prefix {YouPublisherPrefix}

pac solution add-reference --path {PCFControlNamePath}
```

Optionally

- uncomment this in the cdsproj file after the first 2 command
  <PropertyGroup>
  <SolutionPackageType>Unmanaged</SolutionPackageType>
  </PropertyGroup>

```bash
msbuild /t:rebuild /restore /p:Configuration=Release
```

Upload the solution in the /Bin folder to Dataverse.

---

## Input Parameters

| Parameter          | Type    | Description                                               | Required |
| ------------------ | ------- | --------------------------------------------------------- | -------- |
| `controlName`      | String  | Name of the PowerApps control to track                    | true     |
| `enterDelay`       | Integer | Delay (in ms) before triggering the Enter event           | false    |
| `leaveDelay`       | Integer | Delay (in ms) before triggering the Leave event           | false    |
| `enableEnterDelay` | Boolean | Enables a delay (in ms) before triggering the Enter event | true     |
| `enableLeaveDelay` | Boolean | Enables a delay (in ms) before triggering the Leave event | false    |

---

## Output Parameters

| Parameter           | Type    | Description                                                       |
| ------------------- | ------- | ----------------------------------------------------------------- |
| `hasEntered`        | Boolean | Indicates whether the pointer has entered the control             |
| `hasLeft`           | Boolean | Indicates whether the pointer has left the control                |
| `innerGalleryIndex` | Integer | Index of the control within the immediate (inner) gallery, if any |
| `outerGalleryIndex` | Integer | Index of the control within the external (outer) gallery, if any  |
| `controlX`          | Integer | X-coordinate of the control                                       |
| `controlY`          | Integer | Y-coordinate of the control                                       |
