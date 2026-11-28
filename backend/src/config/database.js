import dns from 'node:dns';
import mongoose from 'mongoose';

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');

  const dnsServersSetting = process.env.MONGODB_DNS_SERVERS?.trim();
  if (dnsServersSetting) {
    const dnsServers = dnsServersSetting.split(',').map((server) => server.trim());
    if (dnsServers.some((server) => !server)) {
      throw new Error('MONGODB_DNS_SERVERS must be a comma-separated list of DNS server addresses');
    }
    dns.setServers(dnsServers);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
}
