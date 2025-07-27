# HoverEventControl

## Overview

This PCF adds **hover event** support to Power Apps controls.

The plugin supports advanced scenarios such as:

- Galleries and nested galleries hover events.
- Custom tooltips and svg animations.
- Complex Hover Menus

![hovermenu mp4](https://github.com/user-attachments/assets/06bdef26-daed-44fa-9a44-d9453e609e9b)
![hovericon mp4](https://github.com/user-attachments/assets/3503f384-b7ca-4f7e-81b9-483f271b1d1e)

> ⚠️ This PCF is specifically designed to work in Canvas App Only.

---

## How to create and use the PCF

> ⚠️ Make sure Node.js and the PAC CLI are installed before proceeding.

### Clone the repository

```bash
git clone https://github.com/cosimograssi95/PCF.git
```

```bash
cd PCF/{PCFControlName}

npm install
```

### Create Solution

```bash
pac solution init --publisher-name {YouPublisherName} --publisher-prefix {YouPublisherPrefix}

pac solution add-reference --path {PCFControlNamePath}
```

Optionally you can specify the solution type by uncommenting this section in the `.cdsproj` file.

```xml
<PropertyGroup>
  <SolutionPackageType>Unmanaged</SolutionPackageType>
</PropertyGroup>
```

```bash
msbuild /t:rebuild /restore /p:Configuration=Release
```

---

## Input Parameters

| Parameter          | Type    | Description                                               | Required |
| ------------------ | ------- | --------------------------------------------------------- | -------- |
| `controlName`      | String  | Name of the PowerApps control to track                    | false    |
| `enterDelay`       | Integer | Delay (in ms) before triggering the Enter event           | false    |
| `leaveDelay`       | Integer | Delay (in ms) before triggering the Leave event           | false    |
| `enableEnterDelay` | Boolean | Enables a delay (in ms) before triggering the Enter event | false    |
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
