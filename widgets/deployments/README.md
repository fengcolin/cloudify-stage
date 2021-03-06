### Blueprint deployments
Displays the list of the deployments in the current tenant, according to the user’s permissions. The data can be displayed as a table or list. In the case of a list view, the status of each deployment is also displayed. For information about deployment status, [click here](https://docs.cloudify.co/staging/next/working_with/console/deployments-page)

![blueprint-deployments](https://docs.cloudify.co/staging/next/images/ui/widgets/blueprint-deployments.png)

#### Widget Settings
* `Refresh time interval` - The time interval in which the widget’s data will be refreshed, in seconds. Default: 10 seconds
* `Enable click to drill down` - This option enables redirecting to the deployment’s drill down page upon clicking on a specific deployments. Default: True
* `Blueprint ID to filter by` - TAllows filtering the deployments in this list to those derived from a specific blueprint, by providing its ID (the blueprint ID is its name). Default: empty
* `Display style` - Can be either list or table. The deployments status column is only available in list mode.  Default: List
