import { Module } from '@nestjs/common';
import { VirtualSmsProvider } from './virtualsms/virtualsms.provider';
import { FiveSimProvider } from './fivesim/fivesim.provider';
import { ProviderRouter } from './provider-router';

@Module({
  providers: [VirtualSmsProvider, FiveSimProvider, ProviderRouter],
  exports: [ProviderRouter, VirtualSmsProvider, FiveSimProvider],
})
export class ProvidersModule {}
