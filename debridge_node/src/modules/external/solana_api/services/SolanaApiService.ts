import { Injectable, Logger } from '@nestjs/common';
import { HttpAuthService } from '../../common/HttpAuthService';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GetHistoricalDataRequestDto } from '../dto/request/get.historical.data.request.dto';
import { GetHistoricalDataResponseDto } from '../dto/response/get.historical.data.response.dto';
import { EventFromTransaction, GetEventsFromTransactionsResponseDto } from '../dto/response/get.events.from.transactions.response.dto';
import { GetEventsFromTransactionsRequestDto } from '../dto/request/get.events.from.transactions.request.dto';
import { GetAddressInfoRequestDto } from '../dto/request/get.address.info.request.dto';
import { GetAddressInfoResponseDto } from '../dto/response/get.address.info.response.dto';
import { GetBridgeInfoRequestDto } from '../dto/request/get.bridge.info.request.dto';

@Injectable()
export class SolanaApiService extends HttpAuthService {
  constructor(readonly httpService: HttpService, private readonly configService: ConfigService) {
    super(httpService, new Logger(SolanaApiService.name), configService.get('SOLANA_DATA_READER_API_BASE_URL'), '/login');
  }

  /**
   * Get historical data
   * @param limitSignatures
   * @param searchFrom
   * @param searchTo
   */
  async getHistoricalData(limitSignatures: number, searchFrom?: string, searchTo?: string): Promise<string[]> {
    this.logger.log(`getHistoricalData ${JSON.stringify({ searchFrom, searchTo })} is started`);
    const limit = limitSignatures;
    const dto = { limit, searchFrom, searchTo } as GetHistoricalDataRequestDto;
    this.logger.verbose(`getHistoricalData dto ${JSON.stringify(dto)}`);
    const httpResult = await this.authRequest('/getHistoricalData', dto, this.getLoginDto());
    const { signatures } = httpResult.data as GetHistoricalDataResponseDto;
    this.logger.log(`getHistoricalData ${JSON.stringify({ searchFrom, searchTo })} is finished`);
    return signatures;
  }

  /**
   * Get events from transaction
   * @param signatures
   */
  async getEventsFromTransactions(signatures: string[]): Promise<EventFromTransaction[]> {
    this.logger.log(`getEventsFromTransactions to ${JSON.stringify(signatures)} is started`);
    const dto = { signatures } as GetEventsFromTransactionsRequestDto;
    this.logger.verbose(`getEventsFromTransactions dto ${JSON.stringify(dto)}`);
    const httpResult = await this.authRequest('/getEventsFromTransactions', dto, this.getLoginDto());
    const { events } = httpResult.data as GetEventsFromTransactionsResponseDto;
    this.logger.log(`getEventsFromTransactions to ${JSON.stringify(signatures)} is finished`);
    return events;
  }

  /**
   * Get address info
   * @param address
   */
  async getAddressInfo(address: string): Promise<GetAddressInfoResponseDto> {
    this.logger.log(`getAddressInfo account ${address} is started`);
    const dto = { address } as GetAddressInfoRequestDto;
    this.logger.verbose(`getAddressInfo dto ${JSON.stringify(dto)}`);
    const httpResult = await this.authRequest('/getChainInfo', dto, this.getLoginDto());
    const response = httpResult.data as GetAddressInfoResponseDto;
    this.logger.log(`getAddressInfo account ${address} is finished`);
    return response;
  }

  /**
   * Get bridge info
   * @param bridgeId
   */
  async getBridgeInfo(bridgeId: string): Promise<string[]> {
    this.logger.log(`getBridgeInfo ${bridgeId} is started`);
    const dto = { bridgeId } as GetBridgeInfoRequestDto;
    this.logger.verbose(`getBridgeInfo dto ${JSON.stringify(dto)}`);
    const httpResult = await this.authRequest('/getBridgeInfo', dto, this.getLoginDto());
    const response = httpResult.data as string[];
    this.logger.log(`getBridgeInfo ${bridgeId} is finished`);
    return response;
  }

  private getLoginDto() {
    return {
      login: this.configService.get('SOLANA_API_USER'),
      password: this.configService.get('SOLANA_API_PASSWORD'),
    };
  }
}
