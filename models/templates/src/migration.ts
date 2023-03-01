//
// Copyright © 2022 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import core, { DOMAIN_TX, TxOperations } from '@hcengineering/core'
import { MigrateOperation, MigrationClient, MigrationUpgradeClient } from '@hcengineering/model'
import { DOMAIN_SPACE } from '@hcengineering/model-core'
import templates from './plugin'

export const templatesOperation: MigrateOperation = {
  async migrate (client: MigrationClient): Promise<void> {
    await changeClass(client)
  },
  async upgrade (client: MigrationUpgradeClient): Promise<void> {
    const tx = new TxOperations(client, core.account.System)
    const current = await tx.findOne(core.class.Space, {
      _id: templates.space.Templates
    })
    if (current === undefined) {
      await tx.createDoc(
        templates.class.TemplateCategory,
        core.space.Space,
        {
          name: 'Public templates',
          description: 'Space for public templates',
          private: false,
          archived: false,
          members: []
        },
        templates.space.Templates
      )
    }
  }
}

async function changeClass (client: MigrationClient): Promise<void> {
  await client.update(
    DOMAIN_SPACE,
    {
      _id: templates.space.Templates,
      _class: core.class.Space
    },
    {
      _class: templates.class.TemplateCategory,
      private: false,
      name: 'Public templates',
      description: 'Space for public templates'
    }
  )

  await client.update(
    DOMAIN_TX,
    {
      objectId: templates.space.Templates,
      objectClass: core.class.Space,
      _class: core.class.TxCreateDoc
    },
    {
      objectClass: templates.class.TemplateCategory,
      'attirbutes.private': false,
      'attirbutes.name': 'Public templates',
      'attirbutes.description': 'Space for public templates'
    }
  )
}
